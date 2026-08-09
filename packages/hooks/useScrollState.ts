import { useCallback, useMemo, useRef, useState } from "react";
import { getScrollState, type ScrollState } from "../utils";
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

/** Options for the useScrollState hook. */
interface ScrollStateOptions {
    /** Threshold in pixels for edge detection (default: 0). */
    threshold?: number;
    /** Which observers should be attached (default: all). */
    observers?: ScrollObserver[];
}

/**
 * A React hook to track the scroll status of a DOM element in all four
 * directions (Top, Bottom, Left, Right). It uses native events and observers
 * (Resize/Mutation) for robustness and accurate state tracking.
 *
 * @example
 *     ```tsx
 *     const ref = useRef<HTMLDivElement>(null);
 *     const scrollState = useScrollState(ref.current, { threshold: 5 });
 *
 *     return <div ref={ref}> ... </div>;
 *     ```;
 *
 * @param element - A reference to the scrollable HTML element.
 * @param options - Configuration options for the scroll state and observers.
 * @returns An object containing the current scroll state and an `update`
 *   function.
 */
export function useScrollState<T extends HTMLElement>(
    element: T | null,
    {
        threshold = 0,
        observers = ["scroll", "resize", "mutation"],
    }: ScrollStateOptions = {}
): ScrollState & { update: () => void } {
    // Reference to the animation frame ID
    const rafRef = useRef<number | null>(null);

    // State for the scroll position
    const [state, setState] = useState<ScrollState>(() => getEmptyState());

    // Update function to compute and set the scroll state
    const update = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        if (!element) {
            setState((prev) => {
                const next = getEmptyState();

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
            const next = getScrollState(element, threshold);

            setState((prev) =>
                Object.keys(next).every(
                    (k) =>
                        prev[k as keyof ScrollState] ===
                        next[k as keyof ScrollState]
                )
                    ? prev
                    : next
            );
        });
    }, [element, threshold]);

    // This ensures that the scroll state is recalculated whenever the element or threshold changes.
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

// Returns an empty scroll state for a non-scrollable element (used for initialization).
function getEmptyState(): ScrollState {
    return getScrollState(document.createElement("div"));
}
