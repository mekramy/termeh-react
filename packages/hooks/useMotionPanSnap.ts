import {
    animate,
    useMotionValue,
    useTransform,
    type AnimationPlaybackControls,
    type MotionStyle,
    type ValueAnimationTransition,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useDeepMemoizeLatest } from "./useDeepMemoizeLatest";
import { useLatest } from "./useLatest";
import { useMotionPan, type PanInfo, type PointerType } from "./useMotionPan";
import { useStateRef } from "./useStateRef";

const defaultTransition: ValueAnimationTransition = {
    type: "spring",
    stiffness: 500,
    damping: 40,
    mass: 0.8,
} as const;

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
     * @default 700
     */
    velocityThreshold?: number;

    /**
     * Allow text selection while dragging
     *
     * @default false
     */
    textSelect?: boolean;

    /**
     * Allowed pointer types
     *
     * @default all
     */
    pointerTypes?: PointerType[];

    /** Animation used when snapping to a point */
    transition?: ValueAnimationTransition;

    /** Disable dragging */
    disabled?: () => boolean;

    /** Called when snapped to a specific point (after animation settles) */
    onSnap?: (index: number, value: number) => void;

    /**
     * Called when a drag gesture is cancelled and snaps back to the origin.
     *
     * @param info.isDisabled - `true` if cancelled because `disabled()`
     *   returned true
     * @param info.snap - The origin snap index
     * @param info.nextSnap - The predicted snap index at the time of
     *   cancellation
     */
    onCancel?: (info: {
        isDisabled: boolean;
        snap: number;
        nextSnap: number;
    }) => void;
}

export function useMotionPanSnap({
    axis,
    points: rawPoints,
    initial = 0,
    elastic = true,
    threshold = 0.3,
    velocityThreshold = 700,
    textSelect = false,
    pointerTypes = ["mouse", "touch", "pen"],
    transition = defaultTransition,
    disabled,
    onSnap,
    onCancel,
}: UseMotionPanSnapOptions) {
    const [points, pointsRef] = useDeepMemoizeLatest(
        [...rawPoints].sort((a, b) => a - b)
    );
    const initialState = Math.max(0, Math.min(initial, points.length - 1));
    const [snap, setSnap, snapRef] = useStateRef(initialState);
    const [nextSnap, setNextSnap, nextSnapRef] = useStateRef(initialState);
    const optionsRef = useLatest({
        axis,
        elastic,
        threshold,
        velocityThreshold,
        transition,
        disabled,
        onSnap,
        onCancel,
    });

    const mountedRef = useRef(true);
    const actionIdRef = useRef(0);
    const animationsRef = useRef<AnimationPlaybackControls[]>([]);
    const startValueRef = useRef(points[initialState] ?? 0);
    const isDraggingRef = useRef(false);

    // Motion values
    const x = useMotionValue(axis === "x" ? (points[initialState] ?? 0) : 0);
    const y = useMotionValue(axis === "y" ? (points[initialState] ?? 0) : 0);
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
            const clamped = safeIndex(index);
            const point = pointsRef.current[clamped];
            if (point === undefined) return;

            const prevSnap = snapRef.current;
            setSnap(clamped);
            setNextSnap(clamped);

            animateTo(point, animate, () => {
                if (clamped !== prevSnap) {
                    optionsRef.current.onSnap?.(clamped, point);
                }
            });
        },
        [
            safeIndex,
            pointsRef,
            optionsRef,
            snapRef,
            setSnap,
            setNextSnap,
            animateTo,
        ]
    );

    const reset = useCallback(() => {
        snapTo(initialState);
    }, [initialState, snapTo]);

    // Stable handlers
    const handleStart = useCallback(() => {
        const { axis, disabled } = optionsRef.current;
        if (disabled?.()) {
            isDraggingRef.current = false;
            snapTo(snapRef.current);
            return;
        }

        isDraggingRef.current = true;
        stopAnimations();
        startValueRef.current = axis === "x" ? x.get() : y.get();
    }, [stopAnimations, x, y, optionsRef, snapRef, snapTo]);

    const handleMove = useCallback(
        (info: PanInfo) => {
            const { axis, disabled, onCancel } = optionsRef.current;

            if (disabled?.()) {
                isDraggingRef.current = false;
                onCancel?.({
                    isDisabled: true,
                    snap: snapRef.current,
                    nextSnap: nextSnapRef.current,
                });
                snapTo(snapRef.current);
                return;
            }

            const raw =
                startValueRef.current +
                (axis === "x" ? info.offset.x : info.offset.y);
            const current = applyElastic(raw);

            if (axis === "x") x.set(current);
            else y.set(current);

            const velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const predicted = predictNextSnap(current, velocity);
            if (predicted !== nextSnapRef.current) {
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
            snapTo,
        ]
    );

    const handleEnd = useCallback(
        (info: PanInfo) => {
            const { axis, disabled, onCancel } = optionsRef.current;
            isDraggingRef.current = false;

            if (disabled?.()) {
                onCancel?.({
                    isDisabled: true,
                    snap: snapRef.current,
                    nextSnap: nextSnapRef.current,
                });
                snapTo(snapRef.current);
                return;
            }

            const current = axis === "x" ? x.get() : y.get();
            const velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const targetIndex = findNearestSnap(current, velocity);

            if (
                targetIndex === snapRef.current &&
                !isElasticOverscroll(current)
            ) {
                onCancel?.({
                    isDisabled: false,
                    snap: snapRef.current,
                    nextSnap: nextSnapRef.current,
                });
            }

            snapTo(targetIndex);
        },
        [
            snapTo,
            x,
            y,
            optionsRef,
            snapRef,
            nextSnapRef,
            findNearestSnap,
            isElasticOverscroll,
        ]
    );

    const handlers = useMotionPan({
        pointerTypes,
        onStart: handleStart,
        onMove: handleMove,
        onEnd: handleEnd,
    });

    // Generate style
    const touchAction = axis === "x" ? "pan-y" : "pan-x";
    const textSelection: MotionStyle = textSelect
        ? {}
        : {
              userSelect: "none",
              msUserSelect: "none",
              MozUserSelect: "none",
              WebkitUserSelect: "none",
          };
    const style: MotionStyle = {
        x,
        y,
        touchAction,
        ...textSelection,
    };

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
        const value = pointsRef.current[initialState];
        if (value === undefined) return;

        setSnap(initialState);
        setNextSnap(initialState);

        if (axis === "x") x.set(value);
        else y.set(value);
    }, [pointsRef, optionsRef, initialState, x, y, setSnap, setNextSnap]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            stopAnimations();
        };
    }, [stopAnimations]);

    return {
        x,
        y,
        progress,
        snap,
        nextSnap,
        snapTo,
        reset,
        handlers,
        style,
    };
}
