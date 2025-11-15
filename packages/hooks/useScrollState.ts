import { useRef, useState } from "react";
import { useRefCallback } from "./useRefCallback";

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
 * @param container - A TemplateRef or Ref to the scrollable HTML element.
 * @param options - Configuration options for the scroll state and observers.
 * @returns An object containing comprehensive reactive scroll state properties
 *   and a RefCallback to attach to scrollable element.
 */
export function useScrollState(options: ScrollStateOptions = {}) {
    // Options
    const threshold = options.threshold ?? 0;
    const observers = options.observers ?? ["scroll", "resize", "mutation"];

    // Stats
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

    // API
    const [ref] = useRefCallback<Element>((el) => {
        // Helpers
        const measure = () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                    scrollLeft,
                    scrollWidth,
                    clientWidth,
                } = el;

                // Calculate
                const scrollableX = scrollWidth > clientWidth;
                const scrollableY = scrollHeight > clientHeight;
                const atTop = scrollTop <= threshold;
                const atBottom =
                    scrollTop + clientHeight >= scrollHeight - threshold;
                const atLeft = scrollLeft <= threshold;
                const atRight =
                    scrollLeft + clientWidth >= scrollWidth - threshold;

                // Set Stats
                setState({
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
                });
            });
        };

        // initial measure
        measure();

        // Listeners
        if (observers.includes("scroll")) {
            el.addEventListener("scroll", measure, { passive: true });
        }

        let resizeObserver: ResizeObserver | null = null;
        if (observers.includes("resize")) {
            resizeObserver = new ResizeObserver(measure);
            resizeObserver.observe(el);
        }

        let mutationObserver: MutationObserver | null = null;
        if (observers.includes("mutation")) {
            mutationObserver = new MutationObserver(measure);
            mutationObserver.observe(el, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }

        // Cleanup
        return () => {
            if (observers.includes("scroll")) {
                el.removeEventListener("scroll", measure);
            }
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    });

    return {
        ref,
        ...state,
    };
}
