import type { PanInfo as MotionPanInfo, Point } from "motion/react";
import { useMemo } from "react";
import { useMemoize } from "../react/useMemoize";
import { useStableCallback } from "../react/useStableCallback";

export type PointerType = "mouse" | "touch" | "pen";
export type PanDirection = "up" | "down" | "left" | "right" | "none";

export interface PanInfo {
    point: Point;
    delta: Point;
    offset: Point;
    velocity: Point;
    distance: number;
    angle: number;
    pointerType: PointerType;
    direction: PanDirection;
    directions: PanDirection[];
}

export interface UseMotionPanOptions {
    /**
     * Disable pan callbacks.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Allowed pointer types.
     *
     * @default ["mouse", "pen", "touch"]
     */
    pointerTypes?: PointerType[];

    /** Called when the pan gesture starts. @default undefined */
    onStart?: (info: PanInfo, event: PointerEvent) => void;

    /** Called for each pan move. @default undefined */
    onMove?: (info: PanInfo, event: PointerEvent) => void;

    /** Called when the pan gesture ends. @default undefined */
    onEnd?: (info: PanInfo, event?: PointerEvent) => void;
}

/**
 * Creates Motion pan handler props for a target element.
 *
 * The returned handlers normalize pan data before calling the configured
 * callbacks. Events are ignored when disabled or when their pointer type is not
 * included in `pointerTypes`.
 */
export function useMotionPan({
    disabled = false,
    pointerTypes = ["mouse", "pen", "touch"],
    onStart: _onStart,
    onMove: _onMove,
    onEnd: _onEnd,
}: UseMotionPanOptions = {}) {
    const pointers = useMemoize(pointerTypes);
    const onStart = useStableCallback(_onStart ?? null);
    const onMove = useStableCallback(_onMove ?? null);
    const onEnd = useStableCallback(_onEnd ?? null);

    return useMemo(
        () => ({
            onPanStart(event: PointerEvent, info: MotionPanInfo) {
                const pointerType = normalizePointerType(event.pointerType);
                if (disabled || !pointers.includes(pointerType)) {
                    return;
                }

                onStart(mapPanInfo(info, event), event);
            },

            onPan(event: PointerEvent, info: MotionPanInfo) {
                const pointerType = normalizePointerType(event.pointerType);
                if (disabled || !pointers.includes(pointerType)) {
                    return;
                }

                onMove(mapPanInfo(info, event), event);
            },

            onPanEnd(event: PointerEvent, info: MotionPanInfo) {
                const pointerType = normalizePointerType(event.pointerType);
                if (disabled || !pointers.includes(pointerType)) {
                    return;
                }

                onEnd(mapPanInfo(info, event), event);
            },
        }),
        [disabled, pointers, onStart, onMove, onEnd]
    );
}

function normalizePointerType(type: string): PointerType {
    switch (type) {
        case "touch":
        case "pen":
        case "mouse":
            return type;

        default:
            return "mouse";
    }
}

function resolveDirection(offset: Point): {
    directions: PanDirection[];
    direction: PanDirection;
} {
    const directions: PanDirection[] = [];

    if (offset.x > 0) {
        directions.push("right");
    }

    if (offset.x < 0) {
        directions.push("left");
    }

    if (offset.y > 0) {
        directions.push("down");
    }

    if (offset.y < 0) {
        directions.push("up");
    }

    if (directions.length === 0) {
        return {
            directions: ["none"],
            direction: "none",
        };
    }

    if (directions.length === 1) {
        return {
            directions,
            direction: directions[0]!,
        };
    }

    return {
        directions,
        direction:
            Math.abs(offset.x) >= Math.abs(offset.y)
                ? offset.x > 0
                    ? "right"
                    : "left"
                : offset.y > 0
                  ? "down"
                  : "up",
    };
}

function mapPanInfo(info: MotionPanInfo, event: PointerEvent): PanInfo {
    const offset = {
        x: info.offset.x,
        y: info.offset.y,
    };

    const { directions, direction } = resolveDirection(offset);

    return {
        point: {
            x: info.point.x,
            y: info.point.y,
        },
        delta: {
            x: info.delta.x,
            y: info.delta.y,
        },

        offset,
        velocity: {
            x: info.velocity.x,
            y: info.velocity.y,
        },

        distance: Math.hypot(offset.x, offset.y),
        angle: (Math.atan2(offset.y, offset.x) * 180) / Math.PI,

        pointerType: normalizePointerType(event.pointerType),
        direction,
        directions,
    };
}
