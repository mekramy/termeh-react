import {
    animate,
    MotionValue,
    useMotionValue,
    useTransform,
    type AnimationPlaybackControls,
    type ValueAnimationTransition,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useDeepMemoizeLatest } from "./useDeepMemoizeLatest";
import { useLatest } from "./useLatest";
import {
    type PanDirection,
    type PanInfo,
    type PointerType,
} from "./useMotionPan";
import { useMotionPanScroll } from "./useMotionPanScroll";
import { useStateRef } from "./useStateRef";

const defaultTransition: ValueAnimationTransition = {
    type: "spring",
    stiffness: 500,
    damping: 40,
    mass: 0.8,
} as const;

type SnapCallbackContext = {
    from: number;
    to: number;
    velocity: number;
    fastSwipe: boolean;
    direction: PanDirection;
    pointerType: PointerType;
};

export interface UseMotionPanSnapOptions {
    /** Which axis to drag on */
    axis: "x" | "y";

    /**
     * Snap points sorted ascending.
     *
     * @example
     *     Bottom sheet (closed, half, full): [0, -400, -800]
     *     Swipe reveal (closed, revealed):    [0, -120]
     *     Swipe delete (snap back):           [0]
     */
    points: number[];

    /**
     * Initial snap point index
     *
     * @default 0
     */
    initial?: number;

    /**
     * Enable elastic rubber-band when overscrolling beyond snap points
     *
     * @default true
     */
    elastic?: boolean;

    /**
     * Disable dragging
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Threshold (0..1) within a segment to snap to the next point. 0.2 means
     * you need to drag 20% toward the next point to snap there.
     *
     * @default 0.3
     */
    threshold?: number;

    /**
     * Velocity threshold in px/s. If exceeded, snaps in the direction of
     * velocity regardless of distance.
     *
     * @default 500
     */
    velocityThreshold?: number;

    /**
     * Fast swipe velocity threshold in px/s. If exceeded, triggers a fast swipe
     * action.
     *
     * @default 1000
     */
    fastVelocityThreshold?: number;

    /**
     * Allowed pointer types
     *
     * @default all
     */
    pointerTypes?: PointerType[];

    /** Animation used when snapping to a point */
    transition?: ValueAnimationTransition;

    /**
     * Optional scrollable element to calculate touch-action for.
     *
     * @default null
     */
    scrollableEl?: HTMLElement | null;

    /**
     * Called to determine if a snap is allowed with swipe.
     *
     * @param ctx - The context of the snap gesture
     * @returns True if the snap is allowed, false otherwise
     */
    swipeGuard?: (ctx: SnapCallbackContext) => boolean;

    /** Called when snapped to a specific point (after animation settles) */
    onSnap?: (index: number, value: number) => void;

    /**
     * Called when a drag gesture is cancelled and snaps back to the origin.
     *
     * @param info.snap - The origin snap index
     * @param info.nextSnap - The predicted snap index at the time of
     *   cancellation
     */
    onCancel?: (snap: number, nextSnap: number) => void;

    /**
     * Called when a fast swipe is detected. Return the snap index to snap to,
     * or undefined to ignore.
     *
     * @param ctx - The context of the fast swipe gesture
     * @returns The snap index to snap to, or undefined to ignore
     */
    onFastSwipe?: (ctx: SnapCallbackContext) => number | undefined;
}

export function useMotionPanSnap({
    axis,
    points: _points,
    initial: _initial = 0,
    elastic = true,
    disabled = false,
    threshold = 0.3,
    velocityThreshold = 500,
    fastVelocityThreshold = 1000,
    pointerTypes = ["mouse", "touch", "pen"],
    transition = defaultTransition,
    scrollableEl = null,
    swipeGuard,
    onSnap,
    onCancel,
    onFastSwipe,
}: UseMotionPanSnapOptions) {
    const [points, pointsRef] = useDeepMemoizeLatest(
        [..._points].sort((a, b) => a - b)
    );
    const initial = Math.max(0, Math.min(_initial, points.length - 1));
    const [snap, setSnap, snapRef] = useStateRef(initial);
    const [nextSnap, setNextSnap, nextSnapRef] = useStateRef(initial);
    const optionsRef = useLatest({
        axis,
        elastic,
        disabled,
        threshold,
        velocityThreshold,
        fastVelocityThreshold,
        transition,
        swipeGuard,
        onSnap,
        onCancel,
        onFastSwipe,
    });

    const mountedRef = useRef(true);
    const actionIdRef = useRef(0);
    const animationsRef = useRef<AnimationPlaybackControls[]>([]);
    const startValueRef = useRef(points[initial] ?? 0);
    const isDraggingRef = useRef(false);

    // Motion values
    const x = useMotionValue(axis === "x" ? (points[initial] ?? 0) : 0);
    const y = useMotionValue(axis === "y" ? (points[initial] ?? 0) : 0);
    const progress = useTransform(() => {
        const points = pointsRef.current;
        const { axis } = optionsRef.current;

        const originIdx = snapRef.current;
        const targetIdx = nextSnapRef.current;
        if (originIdx === targetIdx) return 0;

        const origin = points[originIdx];
        const target = points[targetIdx];
        if (origin === undefined || target === undefined) return 0;

        const current = axis === "x" ? x.get() : y.get();
        const segmentSize = Math.abs(target - origin);
        if (segmentSize === 0) return 0;

        return Math.min(
            Math.max(Math.abs(current - origin) / segmentSize, 0),
            1
        );
    });

    // Helpers
    const safeIndex = useCallback(
        (index: number) =>
            Math.max(0, Math.min(pointsRef.current.length - 1, index)),
        [pointsRef]
    );

    const findFirst = useCallback(
        (value: number) => {
            const points = pointsRef.current;
            for (let i = 0; i < points.length; i++) {
                if (points[i]! > value + 0.5) return i;
            }
        },
        [pointsRef]
    );

    const findLast = useCallback(
        (value: number) => {
            const points = pointsRef.current;
            for (let i = points.length - 1; i >= 0; i--) {
                if (points[i]! < value - 0.5) return i;
            }
        },
        [pointsRef]
    );

    const stopAnimations = useCallback(() => {
        for (const anim of animationsRef.current) anim.stop();
        animationsRef.current = [];
    }, []);

    const animateTo = useCallback(
        (target: number, anim?: boolean, callback?: () => void) => {
            stopAnimations();
            const id = ++actionIdRef.current;
            const { axis, transition } = optionsRef.current;

            const then = () => {
                if (!mountedRef.current || id !== actionIdRef.current) return;

                animationsRef.current = [];
                callback?.();
            };

            if (anim) {
                const ax = animate(x, axis === "x" ? target : 0, transition);
                const ay = animate(y, axis === "y" ? target : 0, transition);
                animationsRef.current = [ax, ay];

                Promise.all([ax.finished, ay.finished])
                    .then(() => {
                        then();
                    })
                    .catch(() => {});
            } else {
                x.set(axis === "x" ? target : 0);
                y.set(axis === "y" ? target : 0);
                then();
            }
        },
        [x, y, optionsRef, stopAnimations]
    );

    const snapToInternal = useCallback(
        (index: number, animate: boolean = true) => {
            const { onSnap } = optionsRef.current;

            const clamped = safeIndex(index);
            const point = pointsRef.current[clamped];
            if (point === undefined) return;

            const prevSnap = snapRef.current;
            setSnap(clamped);
            setNextSnap(clamped);

            animateTo(point, animate, () => {
                if (clamped !== prevSnap) {
                    onSnap?.(clamped, point);
                }
            });
        },
        [
            pointsRef,
            optionsRef,
            snapRef,
            safeIndex,
            setSnap,
            setNextSnap,
            animateTo,
        ]
    );

    const predictNextSnap = useCallback(
        (value: number, velocity: number) => {
            const points = pointsRef.current;
            const originIdx = snapRef.current;
            const { velocityThreshold } = optionsRef.current;

            if (points.length === 0) return 0;

            if (Math.abs(velocity) > velocityThreshold * 0.5) {
                const item = velocity > 0 ? findFirst(value) : findLast(value);
                if (item !== undefined) return item;
            }

            let nearest = originIdx;
            let minDist = Infinity;
            for (let i = 0; i < points.length; i++) {
                if (i === originIdx) continue;

                const dist = Math.abs(points[i]! - value);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = i;
                }
            }
            return nearest;
        },
        [optionsRef, pointsRef, snapRef, findFirst, findLast]
    );

    const findNearestSnap = useCallback(
        (value: number, velocity: number) => {
            const points = pointsRef.current;
            const originIdx = snapRef.current;
            const { threshold, velocityThreshold } = optionsRef.current;

            if (points.length === 0) return 0;

            // 1. Velocity-driven snap (flick)
            if (Math.abs(velocity) > velocityThreshold) {
                const item = velocity > 0 ? findFirst(value) : findLast(value);
                if (item !== undefined) return item;
            }

            // 2. Find nearest snap by distance
            let nearestIdx = 0;
            let minDist = Infinity;
            for (let i = 0; i < points.length; i++) {
                const dist = Math.abs(points[i]! - value);
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }
            if (minDist < 1) return nearestIdx;

            // 3. Determine the segment we are in
            let lower = nearestIdx;
            let upper = nearestIdx;
            if (value < points[nearestIdx]!) {
                lower = nearestIdx - 1;
                upper = nearestIdx;
            } else if (value > points[nearestIdx]!) {
                lower = nearestIdx;
                upper = nearestIdx + 1;
            }
            if (lower < 0 || upper >= points.length || lower === upper) {
                return nearestIdx;
            }

            // 4. If origin is outside this segment, user crossed multiple segments
            if (originIdx < lower || originIdx > upper) {
                return nearestIdx;
            }

            // 5. Threshold-based snap FROM ORIGIN (symmetric)
            const origin = points[originIdx]!;
            const segmentSize = Math.abs(points[upper]! - points[lower]!);
            const distFromOrigin = Math.abs(value - origin);
            const progressFromOrigin =
                segmentSize > 0 ? distFromOrigin / segmentSize : 0;

            return progressFromOrigin >= threshold
                ? originIdx === lower
                    ? upper
                    : lower
                : originIdx;
        },
        [optionsRef, pointsRef, snapRef, findFirst, findLast]
    );

    const applyElastic = useCallback(
        (value: number) => {
            const points = pointsRef.current;
            const { elastic } = optionsRef.current;
            if (!elastic || points.length === 0) return value;

            const min = points[0]!;
            const max = points[points.length - 1]!;

            if (value < min) {
                const overscroll = min - value;
                return min - Math.sqrt(overscroll) * 2;
            }

            if (value > max) {
                const overscroll = value - max;
                return max + Math.sqrt(overscroll) * 2;
            }

            return value;
        },
        [optionsRef, pointsRef]
    );

    const isElasticOverscroll = useCallback(
        (value: number) => {
            const points = pointsRef.current;
            if (points.length === 0) return false;

            const min = points[0]!;
            const max = points[points.length - 1]!;
            return value < min || value > max;
        },
        [pointsRef]
    );

    // APIs
    const snapTo = useCallback(
        (index: number, animate: boolean = true) => {
            const { disabled } = optionsRef.current;
            if (disabled) {
                isDraggingRef.current = false;
                return;
            }

            return snapToInternal(index, animate);
        },
        [optionsRef, snapToInternal]
    );

    const reset = useCallback(() => {
        snapTo(initial);
    }, [initial, snapTo]);

    // Stable handlers
    const handleStart = useCallback(() => {
        const { axis, disabled } = optionsRef.current;
        if (disabled) {
            isDraggingRef.current = false;
            return;
        }

        isDraggingRef.current = true;
        stopAnimations();
        startValueRef.current = axis === "x" ? x.get() : y.get();
    }, [x, y, optionsRef, stopAnimations]);

    const handleMove = useCallback(
        (info: PanInfo) => {
            const { axis, disabled, swipeGuard } = optionsRef.current;

            if (disabled) {
                isDraggingRef.current = false;
                snapToInternal(snapRef.current);
                return;
            }

            const offset = axis === "x" ? info.offset.x : info.offset.y;
            const raw = startValueRef.current + offset;
            const velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const predicted = predictNextSnap(raw, velocity);

            // Check swipeGuard
            const isAllowed = swipeGuard
                ? swipeGuard({
                      from: snapRef.current,
                      to: predicted,
                      velocity: velocity,
                      fastSwipe: false,
                      direction: resolveDirection(axis, info.directions),
                      pointerType: info.pointerType,
                  })
                : true;

            // If snap is not allowed, apply elastic effect to show resistance
            const current = isAllowed
                ? applyElastic(raw)
                : applyElastic(startValueRef.current + offset * 0.1);

            if (axis === "x") x.set(current);
            else y.set(current);

            if (isAllowed && predicted !== nextSnapRef.current) {
                setNextSnap(predicted);
            }
        },
        [
            x,
            y,
            optionsRef,
            snapRef,
            nextSnapRef,
            setNextSnap,
            applyElastic,
            predictNextSnap,
            snapToInternal,
        ]
    );

    const handleEnd = useCallback(
        (info: PanInfo) => {
            const {
                axis,
                disabled,
                onCancel,
                fastVelocityThreshold,
                onFastSwipe,
                swipeGuard,
            } = optionsRef.current;
            isDraggingRef.current = false;

            if (disabled) {
                snapToInternal(snapRef.current);
                return;
            }

            const current = axis === "x" ? x.get() : y.get();
            const velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const fastSwipe =
                Math.abs(velocity) > fastVelocityThreshold && !!onFastSwipe;
            const targetIndex = findNearestSnap(current, velocity);

            // Check swipeGuard on end
            const isAllowed = swipeGuard
                ? swipeGuard({
                      from: snapRef.current,
                      to: targetIndex,
                      velocity: velocity,
                      fastSwipe,
                      direction: resolveDirection(axis, info.directions),
                      pointerType: info.pointerType,
                  })
                : true;

            // If snap is not allowed, return to previous step
            if (!isAllowed) {
                snapToInternal(snapRef.current);
                return;
            }

            // Check for fast swipe
            if (fastSwipe) {
                const target = onFastSwipe({
                    from: snapRef.current,
                    to: targetIndex,
                    velocity: velocity,
                    fastSwipe: true,
                    direction: resolveDirection(axis, info.directions),
                    pointerType: info.pointerType,
                });

                if (target !== undefined) {
                    snapToInternal(target);
                    return;
                }
            }

            if (
                targetIndex === snapRef.current &&
                !isElasticOverscroll(current)
            ) {
                onCancel?.(snapRef.current, nextSnapRef.current);
            }

            snapToInternal(targetIndex);
        },
        [
            x,
            y,
            optionsRef,
            snapRef,
            nextSnapRef,
            snapToInternal,
            findNearestSnap,
            isElasticOverscroll,
        ]
    );

    const { touchAction, onPan, onPanStart, onPanEnd } = useMotionPanScroll(
        scrollableEl,
        {
            axis,
            pointerTypes,
            allowUpEdgeSwipe: axis === "y",
            allowDownEdgeSwipe: axis === "y",
            allowLeftEdgeSwipe: axis === "x",
            allowRightEdgeSwipe: axis === "x",
            onStart: handleStart,
            onMove: handleMove,
            onEnd: handleEnd,
        }
    );

    // Lifecycle and resize sync
    useEffect(() => {
        if (isDraggingRef.current) return;

        const clamped = safeIndex(snapRef.current);
        const target = points[clamped];
        if (target === undefined) return;

        if (clamped !== snapRef.current) {
            setSnap(clamped);
            setNextSnap(clamped);
        }

        if (axis === "x") x.set(target);
        else y.set(target);
    }, [points, axis, x, y, snapRef, setSnap, setNextSnap, safeIndex]);

    useEffect(() => {
        if (isDraggingRef.current) return;

        const { axis } = optionsRef.current;
        const value = pointsRef.current[initial];
        if (value === undefined) return;

        setSnap(initial);
        setNextSnap(initial);

        if (axis === "x") x.set(value);
        else y.set(value);
    }, [pointsRef, optionsRef, initial, x, y, setSnap, setNextSnap]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            stopAnimations();
        };
    }, [stopAnimations]);

    return {
        snap,
        nextSnap,
        progress,

        x: disabled ? new MotionValue(0) : x,
        y: disabled ? new MotionValue(0) : y,
        touchAction: disabled ? undefined : touchAction,

        snapTo,
        reset,
        onPan,
        onPanStart,
        onPanEnd,
    };
}

function resolveDirection(
    axis: "x" | "y",
    directions: PanDirection[]
): PanDirection {
    if (axis === "x") {
        if (directions.includes("left")) return "left";
        if (directions.includes("right")) return "right";
    } else {
        if (directions.includes("up")) return "up";
        if (directions.includes("down")) return "down";
    }
    return "none";
}
