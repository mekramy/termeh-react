import {
    animate,
    useMotionValue,
    useTransform,
    type AnimationPlaybackControls,
    type ValueAnimationTransition,
} from "motion/react";
import { useCallback, useEffect, useRef, type RefObject } from "react";
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
    fastSwipe: boolean;
    direction: PanDirection;
    pointerType: PointerType;
};

type SnapGuardCache = {
    from: number;
    to: number;
    result: boolean;
};

export interface UseMotionPanSnapOptions {
    /** Which axis to drag on */
    axis: "x" | "y";

    /**
     * Snap points sorted ascending.
     *
     * @example
     *     Bottom sheet (closed, half, full): [-800, -400, 0]
     *     Swipe reveal (closed, revealed):    [-120, 0]
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
    const [points, pointsRef] = useDeepMemoizeLatest(_points);
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
    const isDraggingRef = useRef(false);
    const startValueRef = useRef(points[initial] ?? 0);
    const swipeGuardRef = useRef<SnapGuardCache | null>(null);
    const animationsRef = useRef<AnimationPlaybackControls[]>([]);

    // Motion values
    const x = useMotionValue(axis === "x" ? (points[initial] ?? 0) : 0);
    const y = useMotionValue(axis === "y" ? (points[initial] ?? 0) : 0);
    const zeroX = useMotionValue(0);
    const zeroY = useMotionValue(0);
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
    const _stopAnimations = useCallback(() => {
        for (const anim of animationsRef.current) anim.stop();
        animationsRef.current = [];
    }, []);

    const _animateTo = useCallback(
        (target: number, anim?: boolean, callback?: () => void) => {
            _stopAnimations();
            const id = ++actionIdRef.current;
            const { axis, transition } = optionsRef.current;

            const then = () => {
                if (mountedRef.current && id === actionIdRef.current) {
                    animationsRef.current = [];
                    callback?.();
                }
            };

            if (anim) {
                const ax = animate(x, axis === "x" ? target : 0, transition);
                const ay = animate(y, axis === "y" ? target : 0, transition);
                animationsRef.current = [ax, ay];

                Promise.all([ax.finished, ay.finished])
                    .then(then)
                    .catch(() => {});
            } else {
                x.set(axis === "x" ? target : 0);
                y.set(axis === "y" ? target : 0);
                then();
            }
        },
        [x, y, optionsRef, _stopAnimations]
    );

    const _snapTo = useCallback(
        (index: number, animate: boolean = true) => {
            const { onSnap } = optionsRef.current;

            const clamped = clamp(index, pointsRef.current.length);
            const point = pointsRef.current[clamped];
            if (point === undefined) return;

            const prevSnap = snapRef.current;
            setSnap(clamped);
            setNextSnap(clamped);

            _animateTo(point, animate, () => {
                if (clamped !== prevSnap) {
                    onSnap?.(clamped, point);
                }
            });
        },
        [pointsRef, optionsRef, snapRef, setSnap, setNextSnap, _animateTo]
    );

    const _cancel = useCallback(
        (target?: number) => {
            swipeGuardRef.current = null;
            isDraggingRef.current = false;
            if (target !== undefined) _snapTo(target);
        },
        [_snapTo]
    );

    // APIs
    const snapTo = useCallback(
        (index: number, animate: boolean = true) => {
            const { disabled } = optionsRef.current;
            if (disabled) return _cancel();

            return _snapTo(index, animate);
        },
        [optionsRef, _cancel, _snapTo]
    );

    const reset = useCallback(
        (animate: boolean = true) => {
            snapTo(initial, animate);
        },
        [initial, snapTo]
    );

    // Stable handlers
    const handleStart = useCallback(() => {
        const { axis, disabled } = optionsRef.current;
        if (disabled) return _cancel();

        _stopAnimations();
        swipeGuardRef.current = null;
        isDraggingRef.current = true;
        startValueRef.current = axis === "x" ? x.get() : y.get();
    }, [x, y, optionsRef, _cancel, _stopAnimations]);

    const handleMove = useCallback(
        (info: PanInfo) => {
            const {
                axis,
                disabled,
                elastic,
                threshold,
                velocityThreshold,
                swipeGuard,
            } = optionsRef.current;
            if (disabled) return _cancel(snapRef.current);

            const from = snapRef.current;
            const offset = axis === "x" ? info.offset.x : info.offset.y;
            const raw = startValueRef.current + offset;
            const restricted = startValueRef.current + offset * 0.1;
            const velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const direction = resolveDirection(axis, info.directions);
            const to = findNearestSnap(
                raw,
                velocity,
                snapRef.current,
                pointsRef.current,
                threshold,
                velocityThreshold,
                "predict"
            );
            const ctx = {
                from,
                to,
                direction,
                fastSwipe: false,
                pointerType: info.pointerType,
            };
            const isAllowed = isSnapAllowed(
                swipeGuard,
                ctx,
                swipeGuardRef,
                false
            );

            // If snap is not allowed, apply elastic effect to show resistance
            const current = isAllowed
                ? elastic
                    ? applyElastic(raw, pointsRef.current)
                    : raw
                : elastic
                  ? applyElastic(restricted, pointsRef.current)
                  : restricted;

            if (axis === "x") x.set(current);
            else y.set(current);

            if (isAllowed && to !== nextSnapRef.current) {
                setNextSnap(to);
            }
        },
        [
            x,
            y,
            optionsRef,
            pointsRef,
            snapRef,
            nextSnapRef,
            setNextSnap,
            _cancel,
        ]
    );

    const handleEnd = useCallback(
        (info: PanInfo) => {
            const {
                axis,
                disabled,
                threshold,
                velocityThreshold,
                fastVelocityThreshold,
                swipeGuard,
                onCancel,
                onFastSwipe,
            } = optionsRef.current;
            if (disabled) return _cancel(snapRef.current);

            const from = snapRef.current;
            const current = axis === "x" ? x.get() : y.get();
            const velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const direction = resolveDirection(axis, info.directions);
            const fastSwipe = Math.abs(velocity) > fastVelocityThreshold;
            const to = findNearestSnap(
                current,
                velocity,
                snapRef.current,
                pointsRef.current,
                threshold,
                velocityThreshold,
                "resolve"
            );
            const ctx = {
                from,
                to,
                direction,
                fastSwipe,
                pointerType: info.pointerType,
            };
            const isAllowed = isSnapAllowed(
                swipeGuard,
                ctx,
                swipeGuardRef,
                true
            );

            swipeGuardRef.current = null;
            isDraggingRef.current = false;

            // Check swipeGuard on end
            if (!isAllowed) return _snapTo(from);

            // Check for fast swipe
            if (fastSwipe && onFastSwipe) {
                const target = onFastSwipe(ctx);
                if (target !== undefined) {
                    _snapTo(target);
                    return;
                }
            }

            if (
                to === snapRef.current &&
                !isElasticOverscroll(current, pointsRef.current)
            ) {
                onCancel?.(snapRef.current, nextSnapRef.current);
            }

            _snapTo(to);
        },
        [x, y, optionsRef, pointsRef, snapRef, nextSnapRef, _cancel, _snapTo]
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

        const clamped = clamp(snapRef.current, points.length);
        const target = points[clamped];
        if (target === undefined) return;

        if (clamped !== snapRef.current) {
            setSnap(clamped);
            setNextSnap(clamped);
        }

        if (axis === "x") x.set(target);
        else y.set(target);
    }, [points, axis, x, y, snapRef, setSnap, setNextSnap]);

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
            _stopAnimations();
        };
    }, [_stopAnimations]);

    return {
        snap,
        nextSnap,
        progress,

        x: disabled ? zeroX : x,
        y: disabled ? zeroY : y,
        touchAction: disabled ? undefined : touchAction,

        snapTo,
        reset,
        onPan,
        onPanStart,
        onPanEnd,
    };
}

// -- Helpers --
function clamp(index: number, length: number) {
    return Math.max(0, Math.min(length - 1, index));
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

function findIndexByValue(
    value: number,
    points: number[],
    pos: "first" | "last"
) {
    if (pos === "first") {
        for (let i = 0; i < points.length; i++) {
            if (points[i]! > value + 0.5) return i;
        }
    } else {
        for (let i = points.length - 1; i >= 0; i--) {
            if (points[i]! < value - 0.5) return i;
        }
    }

    return undefined;
}

function isSnapAllowed(
    guard: UseMotionPanSnapOptions["swipeGuard"],
    ctx: SnapCallbackContext,
    cacheRef: RefObject<SnapGuardCache | null>,
    force: boolean
) {
    if (!guard) return true;
    else if (force) return guard(ctx);
    else {
        if (
            cacheRef.current?.from === ctx.from &&
            cacheRef.current.to === ctx.to
        ) {
            return cacheRef.current.result;
        }

        const result = guard(ctx);
        cacheRef.current = {
            from: ctx.from,
            to: ctx.to,
            result,
        };
        return result;
    }
}

function isElasticOverscroll(value: number, points: number[]) {
    if (points.length === 0) return false;

    const min = points[0]!;
    const max = points[points.length - 1]!;
    return value < min || value > max;
}

function applyElastic(value: number, points: number[]) {
    if (points.length === 0) return value;

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
}

/**
 * Finds the snap point the gesture is currently heading toward.
 *
 * The function has two modes:
 *
 * - `predict`: used during pan to predict the adjacent snap point.
 * - `resolve`: used on pan end to determine whether the gesture crossed the
 *   configured threshold.
 *
 * Values outside the snap range are treated as elastic overscroll. In that
 * case, the nearest boundary snap point is used instead of returning the
 * origin.
 *
 * Strong velocity can override distance-based resolution.
 *
 * @returns The predicted/resolved snap index, or `originIdx` when no valid
 *   destination can be determined.
 */
function findNearestSnap(
    value: number,
    velocity: number,
    originIdx: number,
    points: number[],
    threshold: number,
    velocityThreshold: number,
    mode: "predict" | "resolve"
) {
    const length = points.length;

    if (length === 0 || originIdx < 0 || originIdx >= length) {
        return originIdx;
    }

    const first = points[0]!;
    const last = points[length - 1]!;
    const velocityLimit =
        mode === "predict" ? velocityThreshold * 0.5 : velocityThreshold;

    /*
     * 1. Strong velocity takes priority.
     */
    if (Math.abs(velocity) > velocityLimit) {
        const index = findIndexByValue(
            value,
            points,
            velocity > 0 ? "first" : "last"
        );

        if (index !== undefined && index !== originIdx) {
            return index;
        }
    }

    /*
     * 2. Handle elastic overscroll.
     *
     * Once the value passes the first/last snap point, the closest valid
     * snap is necessarily that boundary.
     */
    if (value <= first) {
        return originIdx === 0 ? originIdx : 0;
    }

    if (value >= last) {
        return originIdx === length - 1 ? originIdx : length - 1;
    }

    /*
     * 3. Find the nearest snap point.
     */
    let nearestIdx = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < length; i++) {
        const distance = Math.abs(points[i]! - value);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIdx = i;
        }
    }

    /*
     * Already at a snap point.
     */
    if (nearestDistance <= 0.5) {
        return nearestIdx;
    }

    /*
     * 4. Find the segment containing the current value.
     */
    const lower = value > points[nearestIdx]! ? nearestIdx : nearestIdx - 1;

    const upper = lower + 1;

    if (lower < 0 || upper >= length) {
        return originIdx;
    }

    /*
     * 5. The current value must be in a segment adjacent to the origin.
     *
     * Otherwise the gesture has crossed more than one snap point.
     */
    if (originIdx !== lower && originIdx !== upper) {
        return nearestIdx;
    }

    const targetIdx = originIdx === lower ? upper : lower;

    /*
     * 6. During pan, the adjacent snap is the prediction.
     */
    if (mode === "predict") {
        return targetIdx;
    }

    /*
     * 7. On pan end, resolve using the configured threshold.
     */
    const segmentSize = Math.abs(points[upper]! - points[lower]!);

    if (segmentSize <= 0) {
        return originIdx;
    }

    const progress = Math.abs(value - points[originIdx]!) / segmentSize;

    return progress >= threshold ? targetIdx : originIdx;
}
