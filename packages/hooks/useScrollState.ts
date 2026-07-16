import { useCallback, useMemo, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./shared";

/**
 * Defines the types of observers that can be used to trigger scroll state
 * updates.
 *
 * - 'scroll': Native scroll event listener on the container (triggered by user
 *   scroll).
 * - 'resize': ResizeObserver (triggered by container size changes).
 * - 'mutation': MutationObserver (triggered by content/DOM structure changes).
 */
type ScrollObserver = "scroll" | "resize" | "mutation";

/** Options for the useScroll composable. */
interface ScrollStateOptions {
    threshold?: number;
    observers?: ScrollObserver[];
}

/**
 * A composable to track the scroll status of a DOM element in all four
 * directions (Top, Bottom, Left, Right). It uses native events and observers
 * (Resize/Mutation) for robustness and accurate state tracking.
 *
 * @param element - A TemplateRef or Ref to the scrollable HTML element.
 * @param options - Configuration options for the scroll state and observers.
 * @returns An object containing comprehensive reactive scroll state properties
 *   and a RefCallback to attach to scrollable element.
 */
export function useScrollState<T extends HTMLElement>(
    element: T | null,
    {
        threshold = 0,
        observers = ["scroll", "resize", "mutation"],
    }: ScrollStateOptions = {}
) {
    const rafRef = useRef<number | null>(null);

    const [state, setState] = useState({
        x: 0,
        y: 0,

        isScrollableX: false,
        isScrollableY: false,

        isAtTop: true,
        isAtBottom: true,
        isAtLeft: true,
        isAtRight: true,

        hasScrollTop: false,
        hasScrollBottom: false,
        hasScrollLeft: false,
        hasScrollRight: false,
    });

    const update = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        if (!element) {
            setState((prev) => {
                const next = {
                    x: 0,
                    y: 0,

                    isScrollableX: false,
                    isScrollableY: false,

                    isAtTop: true,
                    isAtBottom: true,
                    isAtLeft: true,
                    isAtRight: true,

                    hasScrollTop: false,
                    hasScrollBottom: false,
                    hasScrollLeft: false,
                    hasScrollRight: false,
                };

                return Object.keys(next).every(
                    (k) =>
                        prev[k as keyof typeof prev] ===
                        next[k as keyof typeof next]
                )
                    ? prev
                    : next;
            });

            return;
        }

        rafRef.current = requestAnimationFrame(() => {
            const {
                scrollTop,
                scrollHeight,
                clientHeight,
                scrollLeft,
                scrollWidth,
                clientWidth,
            } = element;

            const scrollableX = scrollWidth > clientWidth;
            const scrollableY = scrollHeight > clientHeight;

            const atTop = scrollTop <= threshold;
            const atBottom =
                scrollTop + clientHeight >= scrollHeight - threshold;

            const atLeft = scrollLeft <= threshold;
            const atRight = scrollLeft + clientWidth >= scrollWidth - threshold;

            setState((prev) => {
                const next = {
                    x: scrollLeft,
                    y: scrollTop,

                    isScrollableX: scrollableX,
                    isScrollableY: scrollableY,

                    isAtTop: scrollableY ? atTop : true,
                    isAtBottom: scrollableY ? atBottom : true,

                    isAtLeft: scrollableX ? atLeft : true,
                    isAtRight: scrollableX ? atRight : true,

                    hasScrollTop: scrollableY && !atTop,
                    hasScrollBottom: scrollableY && !atBottom,

                    hasScrollLeft: scrollableX && !atLeft,
                    hasScrollRight: scrollableX && !atRight,
                };

                return Object.keys(next).every(
                    (k) =>
                        prev[k as keyof typeof prev] ===
                        next[k as keyof typeof next]
                )
                    ? prev
                    : next;
            });
        });
    }, [element, threshold]);

    useIsomorphicLayoutEffect(() => {
        update();
    }, [update]);

    useIsomorphicLayoutEffect(() => {
        if (!element) return;

        if (observers.includes("scroll")) {
            element.addEventListener("scroll", update, { passive: true });
        }

        let resizeObserver: ResizeObserver | null = null;
        if (observers.includes("resize")) {
            resizeObserver = new ResizeObserver(update);
            resizeObserver.observe(element);
        }

        let mutationObserver: MutationObserver | null = null;
        if (observers.includes("mutation")) {
            mutationObserver = new MutationObserver(update);
            mutationObserver.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        return () => {
            if (observers.includes("scroll"))
                element.removeEventListener("scroll", update);

            resizeObserver?.disconnect();
            mutationObserver?.disconnect();

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [element, observers, update]);

    return useMemo(
        () => ({
            ...state,
            update,
        }),
        [state, update]
    );
}
