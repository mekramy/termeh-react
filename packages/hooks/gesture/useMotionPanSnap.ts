import {
    animate,
    useMotionValue,
    useTransform,
    type AnimationPlaybackControls,
    type ValueAnimationTransition,
} from "motion/react";
import { useCallback, useRef, useState } from "react";
import { clamp, matches } from "../../utils";
import {
    useComputed,
    useIsMounted,
    useStableCallback,
    useVersionToken,
    useWatch,
} from "../react";
import {
    useMotionPan,
    type PanDirection,
    type PointerType,
} from "./useMotionPan";

const defaultTransition: ValueAnimationTransition = {
    type: "spring",
    stiffness: 500,
    damping: 40,
    mass: 0.8,
} as const;

/** The axis on which pan interaction is enabled. */
type Axis = "x" | "y";

/** The direction of movement relative to the ordered snap points. */
type PanOrientation = "forward" | "backward" | "none";

/** Defines the thresholds and elastic bounds associated with a snap point. */
interface Region {
    /** The absolute position of the snap point. */
    position: number;

    /** The lower position limit for elastic movement. */
    minElastic: number;

    /** The upper position limit for elastic movement. */
    maxElastic: number;

    /** The position threshold for snapping toward the previous point. */
    minThreshold: number;

    /** The position threshold for snapping toward the next point. */
    maxThreshold: number;
}

/**
 * Describes the snap state resolved from the current gesture.
 *
 * Contains the original snap point, the nearest point in the gesture direction,
 * the resolved target, and the number of snap points crossed by the gesture.
 */
interface SwipeContext {
    /** The snap point where the gesture started. */
    origin: number;

    /** The next snap point in the gesture direction. */
    next: number;

    /** The snap point the gesture is currently targeting. */
    target: number;

    /** The number of snap points between the origin and target. */
    steps: number;

    /** The physical direction of the gesture. */
    direction: PanDirection;

    /** The direction of movement relative to the snap point order. */
    orientation: PanOrientation;

    /** The type of pointer that initiated the gesture. */
    pointerType: PointerType;
}

/** Caches the resolved gesture context and its movement boundaries. */
interface CachedSwipeContext extends SwipeContext {
    /** Whether elastic movement is allowed for the current context. */
    elastic: boolean;

    /** Whether swiping toward the resolved target is allowed. */
    swipe?: boolean;

    /** The minimum allowed position before clamping or elastic movement. */
    min: number;

    /** The maximum allowed position before clamping or elastic movement. */
    max: number;

    /** The minimum position reachable with elastic movement. */
    elasticMin: number;

    /** The maximum position reachable with elastic movement. */
    elasticMax: number;
}

/**
 * Determines whether a gesture action is allowed.
 *
 * Returning `false` prevents the swipe action, while `true` or `undefined`
 * allows the default behavior to continue.
 */
export type Guard = (ctx: SwipeContext) => boolean | undefined;

export interface UseMotionPanSnapOptions {
    /** The axis along which dragging is enabled. */
    axis: Axis;

    /** Ordered snap point positions used as gesture targets. */
    points: number[];

    /**
     * The initial snap point index.
     *
     * @default 0
     */
    initial?: number;

    /**
     * Whether elastic resistance is applied beyond the available snap range.
     *
     * @default true
     */
    elastic?: boolean;

    /**
     * Whether pan interaction is disabled.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * The relative distance required to move toward an adjacent snap point
     * before snapping to it.
     *
     * @default 0.3
     */
    threshold?: number;

    /**
     * The velocity required to force snapping in the gesture direction, in
     * px/s.
     *
     * @default 900
     */
    velocityThreshold?: number;

    /**
     * The velocity required to trigger custom fast-swipe handling, in px/s.
     *
     * @default 1800
     */
    fastVelocityThreshold?: number;

    /** The transition used when animating to a snap point. */
    transition?: ValueAnimationTransition;

    /** The pointer types allowed to start a pan gesture. */
    pointerTypes?: PointerType[];

    /** Determines whether movement toward a snap point is allowed. */
    swipeGuard?: Guard;

    /** Determines whether elastic movement is allowed for a snap direction. */
    elasticGuard?: Guard;

    /** Called when the hook becomes mounted and ready. */
    onMounted?: () => void;

    /** Called when the hook is unmounted. */
    onUnMounted?: () => void;

    /** Called after a snap animation completes. */
    onSnap?: (from: number, to: number) => void;

    /** Called when a gesture is cancelled without changing the snap point. */
    onCancel?: (from: number, to: number) => void;

    /**
     * Resolves a target snap index for a fast swipe.
     *
     * Return `undefined` to continue with the default snap resolution.
     */
    onFastSwipe?: (ctx: SwipeContext) => number | undefined;
}

/**
 * Adds snap-based pan interaction along a single axis.
 *
 * Gestures are resolved against an ordered set of snap points using movement
 * thresholds and velocity. The hook also supports elastic overscroll, swipe and
 * elastic guards, custom fast-swipe handling, and animated snapping.
 *
 * The returned motion values expose the current snap index, gesture origin,
 * next and target snap indices, snap distance, position, and normalized
 * progress. It also provides controls for snapping and resetting, together with
 * the pan gesture handlers and mount state.
 *
 * @param options - Configuration for snap points, gesture behavior, guards,
 *   animation, and lifecycle callbacks.
 * @returns Motion values, gesture handlers, and controls for snap-based pan
 *   interaction.
 */
export function useMotionPanSnap({
    axis,
    points,
    initial = 0,
    elastic = true,
    disabled = false,
    threshold = 0.3,
    velocityThreshold = 900,
    fastVelocityThreshold = 1800,
    transition = defaultTransition,
    pointerTypes,
    swipeGuard,
    elasticGuard,
    onMounted,
    onUnMounted,
    onSnap,
    onCancel,
    onFastSwipe,
}: UseMotionPanSnapOptions) {
    const snapCount = points.length;
    const lastSnap = points.length - 1;
    initial = clamp(0, lastSnap, initial);

    /** Lifecycle control */
    const isMounted = useIsMounted(() => {
        onMounted?.();

        return () => {
            _stopAnimations();
            onUnMounted?.();
        };
    });
    const { nextVersion, verifyVersion } = useVersionToken();

    /** Memoized and computed values */
    const regions = useComputed(
        () =>
            points.map<Region>((position, index) => {
                const elasticThreshold = threshold * 0.8;

                const prev = points[index - 1];
                const next = points[index + 1];
                const minDistance = prev === undefined ? 0 : position - prev;
                const maxDistance = next === undefined ? 0 : next - position;

                return {
                    position,

                    minThreshold:
                        prev === undefined
                            ? position
                            : position - minDistance * threshold,
                    maxThreshold:
                        next === undefined
                            ? position
                            : position + maxDistance * threshold,

                    minElastic:
                        prev === undefined
                            ? position - 150
                            : position - minDistance * elasticThreshold,
                    maxElastic:
                        next === undefined
                            ? position + 150
                            : position + maxDistance * elasticThreshold,
                };
            }),
        [points, threshold]
    );

    /** Internal states */
    const isDraggingRef = useRef(false);
    const contextCacheRef = useRef<CachedSwipeContext>(null);
    const startValueRef = useRef(regions[initial]?.position ?? 0);
    const animationControlsRef = useRef<AnimationPlaybackControls>(null);
    const animationDestinationRef = useRef<number | null>(null);

    /** Global states and Motion values */
    const [snap, setSnap] = useState(initial);
    const origin = useMotionValue(initial);
    const next = useMotionValue(initial);
    const target = useMotionValue(initial);
    const steps = useMotionValue(0);
    const position = useMotionValue(regions[initial]?.position ?? 0);
    const progress = useTransform(position, (value) => {
        if (snapCount < 2) return 0;

        if (value <= regions[0]!.position) return 0;
        if (value >= regions[lastSnap]!.position) return 1;

        let index = 0;
        while (index < lastSnap && value > regions[index + 1]!.position) {
            index++;
        }

        const start = regions[index]!.position;
        const end = regions[index + 1]!.position;
        const localProgress = (value - start) / (end - start);

        return (index + localProgress) / lastSnap;
    });

    /** Stop all active animations */
    const _stopAnimations = useStableCallback(() => {
        animationControlsRef.current?.stop();
        animationControlsRef.current = null;
        animationDestinationRef.current = null;
    });

    /** Play move animation to special point */
    const _animateTo = useStableCallback(
        (destination: number, anim?: boolean, callback?: () => void) => {
            _stopAnimations();

            const version = nextVersion();
            animationDestinationRef.current = destination;

            const onComplete = () => {
                if (!isMounted() || !verifyVersion(version)) return;

                animationControlsRef.current = null;
                animationDestinationRef.current = null;
                callback?.();
            };

            if (!anim) {
                position.set(destination);
                onComplete();
                return;
            }

            animationControlsRef.current = animate(
                position,
                destination,
                transition
            );
            animationControlsRef.current.finished
                .then(onComplete)
                .catch(_stopAnimations);
        }
    );

    /** Snap to certain index if not */
    const _snapTo = useStableCallback(
        (index: number, animate: boolean = true) => {
            const perv = snap;
            const clamped = clamp(0, lastSnap, index);
            const destination = points[clamped];

            if (
                destination === undefined ||
                (animationControlsRef.current &&
                    animationDestinationRef.current === destination)
            )
                return;

            if (clamped !== perv) setSnap(clamped);

            _animateTo(destination, animate, () => {
                if (clamped !== perv) onSnap?.(perv, clamped);

                next.set(clamped);
                target.set(clamped);
                steps.set(0);
            });
        }
    );

    /** Cancel dragging */
    const _finishGesture = useCallback(
        (index?: number) => {
            isDraggingRef.current = false;
            contextCacheRef.current = null;
            if (index !== undefined) _snapTo(index);
        },
        [_snapTo]
    );

    /** Snap to certain point */
    const snapTo = useCallback(
        (index: number, animate: boolean = true) => {
            if (disabled) return _finishGesture();
            _snapTo(index, animate);
        },
        [disabled, _snapTo, _finishGesture]
    );

    /** Snap to initial point */
    const reset = useCallback(
        (animate: boolean = true) => {
            snapTo(initial, animate);
        },
        [initial, snapTo]
    );

    /** Update position on points change */
    useWatch(regions, (newRegions) => {
        if (isDraggingRef.current) return;

        const clamped = clamp(0, newRegions.length - 1, snap);
        const destination = newRegions[clamped];
        if (destination === undefined) return;

        position.set(destination.position);
        if (clamped !== snap) setSnap(clamped);
    });

    /** Update position on initial change */
    useWatch(initial, (newInitial) => {
        if (isDraggingRef.current) return;

        const destination = regions[newInitial];
        if (destination === undefined) return;

        setSnap(newInitial);
        origin.set(newInitial);
        next.set(newInitial);
        target.set(newInitial);
        steps.set(0);
        position.set(destination.position);
    });

    const { onPan, onPanStart, onPanEnd } = useMotionPan({
        pointerTypes,
        onStart() {
            if (disabled) return _finishGesture();

            _stopAnimations();
            isDraggingRef.current = true;
            contextCacheRef.current = null;
            startValueRef.current = position.get();
        },
        onMove(info) {
            if (disabled) return _finishGesture(snap);

            const _position =
                startValueRef.current +
                (axis === "x" ? info.offset.x : info.offset.y);
            const _pointInfo = resolvePoints(
                axis,
                _position,
                info.directions,
                snap,
                regions
            );
            const _context = {
                ..._pointInfo,
                origin: snap,
                pointerType: info.pointerType,
            };

            let _next: number = 0,
                _target: number = 0,
                _steps: number = 0,
                _min: number = 0,
                _max: number = 0,
                _elasticMin: number = 0,
                _elasticMax: number = 0,
                _elastic: boolean = false;

            const _cached = contextCacheRef.current;
            if (
                _cached?.swipe === false &&
                _cached.direction === _pointInfo.direction &&
                _cached.orientation === _pointInfo.orientation
            ) {
                _next = _cached.next;
                _target = _cached.target;
                _steps = _cached.steps;
                _min = _cached.min;
                _max = _cached.max;
                _elasticMin = _cached.elasticMin;
                _elasticMax = _cached.elasticMax;
                _elastic = _cached.elastic;
            } else {
                if (
                    !contextCacheRef.current ||
                    !matches(_context, contextCacheRef.current)
                ) {
                    contextCacheRef.current = resolveContext(
                        _context,
                        elastic,
                        swipeGuard,
                        elasticGuard,
                        regions
                    );
                }

                _next = _pointInfo.next;
                _target = _pointInfo.target;
                _steps = _pointInfo.steps;
                _min = contextCacheRef.current.min;
                _max = contextCacheRef.current.max;
                _elasticMin = contextCacheRef.current.elasticMin;
                _elasticMax = contextCacheRef.current.elasticMax;
                _elastic = contextCacheRef.current.elastic;
            }

            position.set(
                applyElastic(
                    _position,
                    _min,
                    _max,
                    _elasticMin,
                    _elasticMax,
                    _elastic
                )
            );
            next.set(_next);
            target.set(_target);
            steps.set(_steps);
        },
        onEnd(info) {
            if (disabled) return _finishGesture(snap);

            const _velocity = axis === "x" ? info.velocity.x : info.velocity.y;
            const _isFastSwipe = Math.abs(_velocity) > fastVelocityThreshold;

            const _pointInfo = resolvePoints(
                axis,
                position.get(),
                info.directions,
                snap,
                regions
            );
            const _context = {
                ..._pointInfo,
                origin: snap,
                pointerType: info.pointerType,
            };

            /** Check for fast swipe */
            if (_isFastSwipe && onFastSwipe) {
                const target = onFastSwipe(_context);
                if (target !== undefined) {
                    _finishGesture(target);
                    return;
                }
            }

            /** Check for guard */
            const resolved = resolveContext(
                _context,
                elastic,
                swipeGuard,
                elasticGuard,
                regions
            );
            if (resolved.swipe === false) {
                _finishGesture(resolved.target);
                return;
            }

            /** Override the normal target by velocity */
            if (
                Math.abs(_velocity) >= velocityThreshold &&
                resolved.next !== snap
            ) {
                resolved.target = resolved.next;
                resolved.steps = Math.abs(resolved.target - resolved.origin);
            }

            const isElastic = isElasticOverscroll(
                position.get(),
                resolved.min,
                resolved.max,
                regions
            );

            if (
                resolved.target === snap &&
                resolved.next !== snap &&
                !isElastic
            ) {
                onCancel?.(snap, resolved.next);
            }

            _finishGesture(resolved.target);
        },
    });

    return {
        snap,
        origin,
        next,
        target,
        steps,
        position,
        progress,

        snapTo,
        reset,
        onPan,
        onPanStart,
        onPanEnd,
        isMounted,
    };
}

function resolveDirection(
    axis: Axis,
    directions: PanDirection[]
): [PanDirection, PanOrientation] {
    if (axis === "x") {
        if (directions.includes("left")) return ["left", "backward"];
        if (directions.includes("right")) return ["right", "forward"];
    } else {
        if (directions.includes("up")) return ["up", "backward"];
        if (directions.includes("down")) return ["down", "forward"];
    }

    return ["none", "none"];
}

function findNext(
    position: number,
    orientation: PanOrientation,
    regions: readonly Region[]
) {
    const length = regions.length;
    if (orientation === "forward") {
        for (let i = 0; i < length; i++) {
            if (regions[i]!.position >= position) return i;
        }
        return length - 1;
    }

    for (let i = length - 1; i >= 0; i--) {
        if (regions[i]!.position <= position) return i;
    }
    return 0;
}

function findTarget(
    position: number,
    orientation: PanOrientation,
    regions: readonly Region[]
) {
    const length = regions.length;
    if (orientation === "forward") {
        for (let i = 0; i < length; i++) {
            if (regions[i]!.maxThreshold >= position) return i;
        }
    }

    if (orientation === "backward") {
        for (let i = length - 1; i >= 0; i--) {
            if (regions[i]!.minThreshold <= position) return i;
        }
    }

    return undefined;
}

function resolvePoints(
    axis: Axis,
    position: number,
    directions: PanDirection[],
    origin: number,
    regions: readonly Region[]
): {
    next: number;
    target: number;
    steps: number;
    direction: PanDirection;
    orientation: PanOrientation;
} {
    const length = regions.length;
    const [direction, orientation] = resolveDirection(axis, directions);

    if (length === 0 || direction === "none" || origin < 0 || origin >= length)
        return {
            next: origin,
            target: origin,
            steps: 0,
            direction,
            orientation,
        };

    const next = findNext(position, orientation, regions);
    if (next === origin)
        return {
            next,
            target: next,
            steps: 0,
            direction,
            orientation,
        };

    const target = findTarget(position, orientation, regions);
    if (target === undefined) {
        return {
            next,
            target: origin,
            steps: 0,
            direction,
            orientation,
        };
    }

    return {
        next,
        target,
        steps: Math.abs(target - origin),
        direction,
        orientation,
    };
}

function resolveContext(
    context: SwipeContext,
    allowElastic: boolean,
    swipeGuard: Guard | undefined,
    elasticGuard: Guard | undefined,
    regions: readonly Region[]
): CachedSwipeContext {
    const length = regions.length - 1;
    const first = regions[0];
    const last = regions[length];

    if (first === undefined || last === undefined) {
        return {
            ...context,
            swipe: undefined,
            elastic: false,
            min: 0,
            max: 0,
            elasticMin: 0,
            elasticMax: 0,
        };
    }

    const swipe = swipeGuard?.(context);
    const isEdge =
        (context.orientation === "backward" && context.target === 0) ||
        (context.orientation === "forward" && context.target === length);
    const elastic =
        swipe === false || isEdge
            ? (elasticGuard?.(context) ?? allowElastic)
            : false;

    let min = first.position;
    let max = last.position;
    let elasticMin = min;
    let elasticMax = max;

    if (swipe === false || isEdge) {
        const region = regions[context.target];

        if (region !== undefined) {
            if (context.orientation === "backward") {
                min = region.position;
                elasticMin = region.minElastic;
            } else if (context.orientation === "forward") {
                max = region.position;
                elasticMax = region.maxElastic;
            }
        }
    }

    return {
        ...context,
        swipe,
        elastic,
        min,
        max,
        elasticMin,
        elasticMax,
    };
}

function applyElastic(
    position: number,
    min: number,
    max: number,
    elasticMin: number,
    elasticMax: number,
    elastic: boolean
): number {
    if (position < min) {
        if (!elastic) return min;

        const overscroll = min - position;
        const value = min - Math.sqrt(overscroll) * 2;

        return Math.max(elasticMin, value);
    }

    if (position > max) {
        if (!elastic) return max;

        const overscroll = position - max;
        const value = max + Math.sqrt(overscroll) * 2;

        return Math.min(elasticMax, value);
    }

    return position;
}

function isElasticOverscroll(
    position: number,
    min: number,
    max: number,
    regions: Region[]
) {
    const length = regions.length;
    if (length === 0) return false;
    return position < min || position > max;
}
