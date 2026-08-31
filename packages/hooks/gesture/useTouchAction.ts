import { useMemo, type CSSProperties } from "react";
import type { ScrollState } from "../../utils";

export type TouchAction = CSSProperties["touchAction"];

export interface UseTouchActionOptions {
    /** The axis along which panning is enabled. */
    axis: "x" | "y" | "both";

    /**
     * Whether touch-action resolution is disabled.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Whether downward panning is allowed when the scrollable element is at the
     * top edge.
     *
     * @default true
     */
    allowUpEdgeSwipe?: boolean;

    /**
     * Whether upward panning is allowed when the scrollable element is at the
     * bottom edge.
     *
     * @default true
     */
    allowDownEdgeSwipe?: boolean;

    /**
     * Whether rightward panning is allowed when the scrollable element is at
     * the left edge.
     *
     * @default true
     */
    allowLeftEdgeSwipe?: boolean;

    /**
     * Whether leftward panning is allowed when the scrollable element is at the
     * right edge.
     *
     * @default true
     */
    allowRightEdgeSwipe?: boolean;
}

/**
 * Resolves the CSS `touch-action` value for a scrollable element.
 *
 * The resolved value reflects the enabled pan axis, available scroll
 * directions, and edge-swipe constraints. When an edge swipe is allowed, the
 * corresponding pan direction is preserved so the gesture can leave the
 * scrollable area.
 *
 * Returns `"auto"` when disabled, `"none"` when no scrolling is available, or
 * the appropriate directional `touch-action` value otherwise.
 *
 * @param scrollState - The current scrollability and edge state.
 * @param options - Axis and edge-swipe configuration.
 * @returns The resolved CSS `touch-action` value.
 */
export function useTouchAction(
    {
        canScrollHorizontally,
        canScrollVertically,
        isLeftEdgeReached,
        isRightEdgeReached,
        isTopEdgeReached,
        isBottomEdgeReached,
    }: ScrollState,
    {
        axis = "both",
        disabled = false,
        allowUpEdgeSwipe = true,
        allowDownEdgeSwipe = true,
        allowLeftEdgeSwipe = true,
        allowRightEdgeSwipe = true,
    }: UseTouchActionOptions
): TouchAction {
    const touchAction = useMemo<TouchAction>(() => {
        if (!disabled) {
            if (axis === "x") {
                if (!canScrollHorizontally) return "none";
                if (isLeftEdgeReached && allowLeftEdgeSwipe) return "pan-right";
                if (isRightEdgeReached && allowRightEdgeSwipe)
                    return "pan-left";
                return "pan-x";
            } else if (axis === "y") {
                if (!canScrollVertically) return "none";
                if (isTopEdgeReached && allowUpEdgeSwipe) return "pan-down";
                if (isBottomEdgeReached && allowDownEdgeSwipe) return "pan-up";
                return "pan-y";
            } else {
                if (canScrollHorizontally && canScrollVertically)
                    return "pan-x pan-y";
                else if (canScrollHorizontally) {
                    if (isLeftEdgeReached && allowLeftEdgeSwipe)
                        return "pan-right";
                    if (isRightEdgeReached && allowRightEdgeSwipe)
                        return "pan-left";
                    return "pan-x";
                } else if (canScrollVertically) {
                    if (isTopEdgeReached && allowUpEdgeSwipe) return "pan-down";
                    if (isBottomEdgeReached && allowDownEdgeSwipe)
                        return "pan-up";
                    return "pan-y";
                }
                return "none";
            }
        }

        return "auto";
    }, [
        axis,
        disabled,
        allowUpEdgeSwipe,
        allowDownEdgeSwipe,
        allowLeftEdgeSwipe,
        allowRightEdgeSwipe,
        canScrollHorizontally,
        canScrollVertically,
        isTopEdgeReached,
        isBottomEdgeReached,
        isLeftEdgeReached,
        isRightEdgeReached,
    ]);

    return touchAction;
}
