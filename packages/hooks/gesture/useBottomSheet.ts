import { useTransform } from "motion/react";
import { useCallback } from "react";
import { type ViewportMetrics } from "../../utils";
import {
    useMotionPanSnap,
    type UseMotionPanSnapOptions,
} from "./useMotionPanSnap";

const NORMAL_MAPPING: BottomSheetState[] = ["normal", "closed"];
const EXPANDED_MAPPING: BottomSheetState[] = ["expanded", "normal", "closed"];

/** The current state of the bottom sheet. */
type BottomSheetState = "closed" | "normal" | "expanded";

/** Configuration options for the useBottomSheet hook. */
export interface UseBottomSheetOptons extends Omit<
    UseMotionPanSnapOptions,
    | "axis"
    | "points"
    | "initial"
    | "swipeGuard"
    | "elasticGuard"
    | "onMounted"
    | "onUnMounted"
    | "onSnap"
    | "onCancel"
    | "onFastSwipe"
> {
    /**
     * Viewport metrics used to calculate the sheet's expanded, normal, and
     * closed positions.
     */
    viewport: ViewportMetrics;

    /**
     * Top inset maintained when the sheet is expanded.
     *
     * @default 0
     */
    gap?: number;

    /**
     * Initial state of the sheet.
     *
     * @default "normal"
     */
    initial?: "normal" | "expanded";

    /**
     * Whether the sheet can be expanded to the top gap.
     *
     * @default true
     */
    expandable?: boolean;

    /**
     * Whether the sheet can be closed by swiping down.
     *
     * @default true
     */
    closable?: boolean;

    /**
     * Whether a fast downward swipe closes the sheet from any state.
     *
     * @default false
     */
    fastClose?: boolean;

    /**
     * Opacity range applied while the sheet is closing.
     *
     * The first value represents the first represents the opacity at the end of
     * the close transition and the second represents fully visible state and.
     *
     * @default [0.1, 1]
     */
    opacityRange?: [number, number];

    /** Called when the sheet is mounted and opened. */
    onOpen?: () => void;

    /** Called when the sheet settles at its normal state. */
    onRestore?: () => void;

    /** Called when the sheet settles at its expanded state. */
    onExpand?: () => void;

    /** Called when the sheet settles at its closed state. */
    onClose?: () => void;
}

/**
 * Manages the state, position, and gesture interaction of a bottom sheet.
 *
 * The sheet supports normal, expanded, and closed states, with optional
 * expansion, swipe-to-close, fast-close, elastic movement, and animated
 * transitions.
 *
 * The returned values include the current state, normalized drag progress,
 * motion values for position, height, and opacity, state controls, and pan
 * gesture handlers.
 *
 * @param options - Configuration for the sheet viewport, states, gestures,
 *   animation, and callbacks.
 * @returns The sheet state, motion values, state controls, and pan handlers.
 */
export function useBottomSheet({
    viewport,
    gap = 0,
    initial = "normal",
    expandable = true,
    closable = true,
    fastClose = false,
    opacityRange = [0.1, 1],
    elastic,
    disabled,
    threshold = 0.15,
    velocityThreshold = 500,
    fastVelocityThreshold,
    transition,
    pointerTypes,
    onOpen,
    onRestore,
    onExpand,
    onClose,
}: UseBottomSheetOptons) {
    const { height: viewportHeight, maxAccessibleHeight } = viewport;

    // Measuring
    const normalY = viewportHeight - maxAccessibleHeight;
    const expandedY = gap;
    const closedY = viewportHeight;
    const points = expandable
        ? [expandedY, normalY, closedY]
        : [normalY, closedY];

    const mapping = expandable ? EXPANDED_MAPPING : NORMAL_MAPPING;

    // Resolve indexes
    const closeIdx = mapping.indexOf("closed");
    const normalIdx = mapping.indexOf("normal");
    const expandedIdx = mapping.indexOf("expanded");

    const initialIdx = mapping.indexOf(expandable ? initial : "normal");

    // Core Api
    const {
        isMounted,
        snap,

        next,
        target,
        position,
        progress,

        snapTo,
        onPan,
        onPanStart,
        onPanEnd,
    } = useMotionPanSnap({
        axis: "y",
        points,
        initial: initialIdx,
        elastic,
        disabled,
        threshold,
        velocityThreshold,
        fastVelocityThreshold,
        transition,
        pointerTypes,
        onMounted: onOpen,
        swipeGuard: ({ next }) =>
            !closable && next === closeIdx ? false : undefined,
        elasticGuard: ({ direction, target }) =>
            direction === "up" || target === closeIdx ? false : undefined,
        onSnap: (_, to) => {
            if (!isMounted()) return;

            switch (mapping[to]) {
                case "closed":
                    return onClose?.();

                case "normal":
                    return onRestore?.();

                case "expanded":
                    return onExpand?.();
            }
        },
        onFastSwipe: ({ direction }) => {
            if (closable && fastClose && direction === "down") {
                return closeIdx;
            }
        },
    });

    const close = useCallback(() => snapTo(closeIdx), [closeIdx, snapTo]);

    const restore = useCallback(() => snapTo(normalIdx), [normalIdx, snapTo]);

    const expand = useCallback(() => {
        if (!expandable) return restore();

        snapTo(expandedIdx);
    }, [expandable, expandedIdx, restore, snapTo]);

    // Stats
    const state = mapping[snap];
    const height = useTransform([next, position], () =>
        next.get() === closeIdx
            ? maxAccessibleHeight
            : viewportHeight - position.get()
    );
    const y = useTransform([next, position], () =>
        next.get() === closeIdx ? position.get() - normalY : 0
    );
    const opacity = useTransform([progress, target], () => {
        const [min, max] = opacityRange;

        if (min >= 0 && max <= 1 && min < max && target.get() === closeIdx) {
            return min + progress.get() * (max - min);
        }

        return 1;
    });

    return {
        state,
        progress,

        y,
        height,
        opacity,

        close,
        restore,
        expand,

        onPan,
        onPanStart,
        onPanEnd,
    };
}
