import { useTransform } from "motion/react";
import { useCallback, useRef } from "react";
import { type ViewportMetrics } from "../../utils";
import {
    useMotionPanSnap,
    type UseMotionPanSnapOptions,
} from "./useMotionPanSnap";

const CLOSED_IDX = 2;
const NORMAL_IDX = 1;
const EXPANDED_IDX = 0;
const STATES: readonly BottomSheetState[] = ["expanded", "normal", "closed"];

/** The current state of the bottom sheet. */
type BottomSheetState = "closed" | "normal" | "expanded";

/** Configuration options for the useBottomSheet hook. */
export interface UseBottomSheetOptions extends Omit<
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
     * Whether the sheet animates from the closed position to its initial state
     * when mounted.
     *
     * @default true
     */
    enterAnimation?: boolean;

    /**
     * Whether the sheet has elastic behavior when expanded.
     *
     * @default true
     */
    elasticExpand?: boolean;

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
    expandable = true,
    closable = true,
    fastClose = false,
    enterAnimation = true,
    elasticExpand = true,
    opacityRange = [0.1, 1],
    elastic,
    disabled,
    threshold,
    velocityThreshold,
    fastVelocityThreshold,
    transition,
    pointerTypes,
    onOpen,
    onRestore,
    onExpand,
    onClose,
}: UseBottomSheetOptions) {
    const { height: viewportHeight, maxAccessibleHeight } = viewport;

    // Measuring
    const normalY = viewportHeight - maxAccessibleHeight;
    const expandedY = gap;
    const closedY = viewportHeight;
    const points = [expandedY, normalY, closedY];

    /** Handle enter animation */
    const entering = useRef(enterAnimation);

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
        initial: enterAnimation ? CLOSED_IDX : NORMAL_IDX,
        elastic,
        disabled,
        threshold,
        velocityThreshold,
        fastVelocityThreshold,
        transition,
        pointerTypes,
        onMounted: () => {
            if (enterAnimation) snapTo(NORMAL_IDX);
            onOpen?.();
        },
        swipeGuard: ({ next }) => {
            if (next === EXPANDED_IDX && !expandable) {
                return false;
            }

            if (next === CLOSED_IDX && !closable) {
                return false;
            }

            return undefined;
        },
        elasticGuard: ({ direction, target }) => {
            if (direction === "down" && target === CLOSED_IDX) {
                return false;
            }

            if (
                direction === "up" &&
                (target !== NORMAL_IDX || !elasticExpand)
            ) {
                return false;
            }

            return undefined;
        },
        onSnap: (_, to) => {
            if (!isMounted()) return;

            if (entering.current) entering.current = false;

            switch (to) {
                case CLOSED_IDX:
                    return onClose?.();

                case NORMAL_IDX:
                    return onRestore?.();

                case EXPANDED_IDX:
                    return onExpand?.();
            }
        },
        onFastSwipe: ({ direction }) => {
            if (closable && fastClose && direction === "down") {
                return CLOSED_IDX;
            }
        },
    });

    const close = useCallback(() => snapTo(CLOSED_IDX), [snapTo]);

    const restore = useCallback(() => snapTo(NORMAL_IDX), [snapTo]);

    const expand = useCallback(() => snapTo(EXPANDED_IDX), [snapTo]);

    // Stats
    const state = STATES[snap];
    const height = useTransform([next, position], () =>
        next.get() === CLOSED_IDX
            ? maxAccessibleHeight
            : viewportHeight - position.get()
    );
    const y = useTransform([next, position], () =>
        next.get() === CLOSED_IDX ? position.get() - normalY : 0
    );
    const opacity = useTransform([progress, target], () => {
        const [min, max] = opacityRange;

        if (
            !entering.current &&
            min >= 0 &&
            max <= 1 &&
            min < max &&
            target.get() === CLOSED_IDX
        ) {
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
