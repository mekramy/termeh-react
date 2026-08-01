import type { PanInfo as MotionPanInfo, Point } from "motion/react";
import { useMemo } from "react";

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
     * Disable all pan callbacks.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Allowed pointer input types.
     *
     * @default all
     */
    pointerTypes?: PointerType[];

    /** Called when pan starts. */
    onStart?: (info: PanInfo, event: PointerEvent) => void;

    /** Called while panning. */
    onMove?: (info: PanInfo, event: PointerEvent) => void;

    /** Called when pan ends. */
    onEnd?: (info: PanInfo, event?: PointerEvent) => void;
}

/**
 * Adapter hook for Motion pan gestures.
 *
 * Use returned handlers on motion components:
 *
 * @example
 *     <motion.div {...panHandlers} />
 */
export function useMotionPan({
    disabled = false,
    pointerTypes = ["mouse", "pen", "touch"],
    onStart,
    onMove,
    onEnd,
}: UseMotionPanOptions = {}) {
    return useMemo(
        () => ({
            onPanStart(event: PointerEvent, info: MotionPanInfo) {
                const pointerType = normalizePointerType(event.pointerType);
                if (disabled || !pointerTypes.includes(pointerType)) {
                    return;
                }

                onStart?.(mapPanInfo(info, event), event);
            },

            onPan(event: PointerEvent, info: MotionPanInfo) {
                const pointerType = normalizePointerType(event.pointerType);
                if (disabled || !pointerTypes.includes(pointerType)) {
                    return;
                }

                onMove?.(mapPanInfo(info, event), event);
            },

            onPanEnd(event: PointerEvent, info: MotionPanInfo) {
                const pointerType = normalizePointerType(event.pointerType);
                if (disabled || !pointerTypes.includes(pointerType)) {
                    return;
                }

                onEnd?.(mapPanInfo(info, event), event);
            },
        }),
        [disabled, pointerTypes, onStart, onMove, onEnd]
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
