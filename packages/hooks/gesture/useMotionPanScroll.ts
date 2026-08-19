import { useMotionPan, type UseMotionPanOptions } from "./useMotionPan";
import { useTouchAction, type UseTouchActionOptions } from "./useTouchAction";

export interface UseMotionPanScrollOptions
    extends UseMotionPanOptions, UseTouchActionOptions {}

/**
 * Connects pan gesture handlers and touch-action rules to a scrollable element.
 *
 * @param scrollEl The scrollable element, or `null` before it is available.
 * @param options Pan and touch-action configuration.
 * @returns Pan lifecycle handlers (`onPan`, `onPanStart`, and `onPanEnd`) and
 *   the resolved `touchAction` value.
 */
export function useMotionPanScroll(
    scrollEl: HTMLElement | null,
    {
        axis,
        disabled,
        onStart,
        onMove,
        onEnd,
        pointerTypes,
        allowUpEdgeSwipe,
        allowDownEdgeSwipe,
        allowLeftEdgeSwipe,
        allowRightEdgeSwipe,
    }: UseMotionPanScrollOptions
) {
    const { onPan, onPanStart, onPanEnd } = useMotionPan({
        disabled,
        pointerTypes,
        onStart,
        onMove,
        onEnd,
    });

    const touchAction = useTouchAction(scrollEl, {
        axis,
        disabled,
        allowUpEdgeSwipe,
        allowDownEdgeSwipe,
        allowLeftEdgeSwipe,
        allowRightEdgeSwipe,
    });

    return {
        onPan,
        onPanStart,
        onPanEnd,
        touchAction,
    };
}
