import { useMemo, type CSSProperties } from "react";
import { useScrollState } from "./useScrollState";

export type TouchAction = CSSProperties["touchAction"];

/** Options for configuring browser edge-panning behavior. */
export interface UseTouchActionOptions {
    /**
     * Axis to resolve for the active touch-action value.
     *
     * @default "both"
     */
    axis: "x" | "y" | "both";

    /**
     * Bypass scroll-state analysis and return `auto`.
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Allow a top-edge upward swipe to continue panning.
     *
     * @default true
     */
    allowUpEdgeSwipe?: boolean;

    /**
     * Allow a bottom-edge downward swipe to continue panning.
     *
     * @default true
     */
    allowDownEdgeSwipe?: boolean;

    /**
     * Allow a left-edge leftward swipe to continue panning.
     *
     * @default true
     */
    allowLeftEdgeSwipe?: boolean;

    /**
     * Allow a right-edge rightward swipe to continue panning.
     *
     * @default true
     */
    allowRightEdgeSwipe?: boolean;
}

/**
 * Resolve a CSS `touch-action` value from the active scroll direction and edge
 * state.
 *
 * The value is computed ahead of a gesture so the browser can apply the
 * intended edge-panning restrictions.
 *
 * @param element Scrollable element to inspect.
 * @param options Edge-swipe configuration.
 * @returns A CSS `touch-action` value.
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
