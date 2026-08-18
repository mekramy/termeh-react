import { useCallback, useRef, useState } from "react";
import { getScrollState, retainOrReplace, type ScrollState } from "../../utils";
import { useIsomorphicLayoutEffect } from "../react";
import { useDeepMemoize } from "../react/useDeepMemoize";

/** Supported scroll event observers. */
type ScrollObserver = "scroll" | "resize" | "mutation";

interface ScrollStateOptions {
    /**
     * Pixel threshold used for edge detection.
     *
     * @default 0
     */
    threshold?: number;

    /**
     * Scroll observers to attach.
     *
     * @default ["scroll", "resize", "mutation"]
     */
    observers?: ScrollObserver[];
}

/**
 * Tracks whether a scrollable element is at the start or end of its scroll
 * range.
 *
 * Returns the current scroll state and an `update` function that recomputes it
 * immediately.
 *
 * @param element - Scrollable element to observe. Defaults to `null` when
 *   unmounted or unavailable.
 * @param options - Scroll detection settings.
 * @param options.threshold - Edge detection threshold in pixels. Defaults to
 *   `0`.
 * @param options.observers - Observers to attach. Defaults to `["scroll",
 *   "resize", "mutation"]`.
 * @returns Current scroll state plus an `update` method to recalculate the
 *   state.
 */
export function useScrollState<T extends HTMLElement>(
    element: T | null,
    {
        threshold = 0,
        observers = ["scroll", "resize", "mutation"],
    }: ScrollStateOptions = {}
) {
    const rafRef = useRef<number | null>(null);
    const observersMem = useDeepMemoize(observers);
    const [state, setState] = useState(getEmptyState);

    const update = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        if (!element) {
            setState((prev) => retainOrReplace(prev, getEmptyState()));
            return;
        }

        rafRef.current = requestAnimationFrame(() => {
            setState((prev) =>
                retainOrReplace(prev, getScrollState(element, threshold))
            );
        });
    }, [element, threshold]);

    useIsomorphicLayoutEffect(() => {
        if (!element) return update();

        if (observersMem.includes("scroll"))
            element.addEventListener("scroll", update, { passive: true });

        let resizeObserver: ResizeObserver | null = null;
        if (observersMem.includes("resize")) {
            resizeObserver = new ResizeObserver(update);
            resizeObserver.observe(element);
        }

        let mutationObserver: MutationObserver | null = null;
        if (observersMem.includes("mutation")) {
            mutationObserver = new MutationObserver(update);
            mutationObserver.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        return () => {
            if (observersMem.includes("scroll"))
                element.removeEventListener("scroll", update);

            resizeObserver?.disconnect();
            mutationObserver?.disconnect();

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [element, observersMem, update]);

    return {
        ...state,
        update,
    };
}

function getEmptyState(): ScrollState {
    return getScrollState(document.createElement("div"));
}
