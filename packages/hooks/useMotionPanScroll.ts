import { useMotionPan, type UseMotionPanOptions } from "./useMotionPan";
import { useTouchAction, type UseTouchActionOptions } from "./useTouchAction";

/**
 * Options for combining motion pan event handling with scroll touch-action
 * configuration.
 */
export interface UseMotionPanScrollOptions
    extends UseMotionPanOptions, UseTouchActionOptions {}

/**
 * Attaches pan gesture event handlers and touch-action behavior to a scrollable
 * element.
 *
 * @param scrollEl The element whose scroll container is being managed.
 * @param options Motion pan and touch-action configuration.
 * @returns The pan event handlers and resolved touch-action style helpers.
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
