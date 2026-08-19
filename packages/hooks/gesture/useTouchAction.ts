import { useMemo, type CSSProperties } from "react";
import { useScrollState } from "../dom";

export type TouchAction = CSSProperties["touchAction"];

export interface UseTouchActionOptions {
    /**
     * Axis used to resolve the touch-action value.
     *
     * @default "both"
     */
    axis: "x" | "y" | "both";

    /**
     * Return `auto` without analyzing scroll state.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Allow upward panning from the top edge.
     *
     * @default true
     */
    allowUpEdgeSwipe?: boolean;

    /**
     * Allow downward panning from the bottom edge.
     *
     * @default true
     */
    allowDownEdgeSwipe?: boolean;

    /**
     * Allow leftward panning from the left edge.
     *
     * @default true
     */
    allowLeftEdgeSwipe?: boolean;

    /**
     * Allow rightward panning from the right edge.
     *
     * @default true
     */
    allowRightEdgeSwipe?: boolean;
}

/**
 * Resolve the CSS `touch-action` value for a scrollable element.
 *
 * The value is based on the selected axis, scroll state, and edge-swipe
 * options. It is computed before a gesture starts so the browser can enforce
 * the requested panning behavior.
 *
 * Returns `"auto"` when no element is provided or the hook is disabled, and
 * `"none"` when the selected axis cannot scroll.
 *
 * @param element Scrollable element to inspect.
 * @param options Axis, disabled state, and edge-swipe configuration.
 * @returns The CSS `touch-action` value for the current scroll state.
 */
export function useTouchAction(
    element: HTMLElement | null,
    {
        axis = "both",
        disabled = false,
        allowUpEdgeSwipe = true,
        allowDownEdgeSwipe = true,
        allowLeftEdgeSwipe = true,
        allowRightEdgeSwipe = true,
    }: UseTouchActionOptions
): TouchAction {
    const {
        canScrollHorizontally,
        canScrollVertically,

        isTopEdgeReached,
        isBottomEdgeReached,
        isLeftEdgeReached,
        isRightEdgeReached,
    } = useScrollState(element);

    return useMemo<TouchAction>(() => {
        if (!disabled && element) {
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
        element,
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
}
