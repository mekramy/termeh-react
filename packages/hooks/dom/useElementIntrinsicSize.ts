"use client";

import { useCallback, useRef, useState } from "react";
import {
    getElementIntrinsicSize,
    retainOrReplace,
    type ElementSize,
} from "../../utils";
import { useIsomorphicLayoutEffect } from "../react";

export interface UseElementIntrinsicSizeOptions<T extends HTMLElement> {
    /**
     * The scrollable container element that may affect the intrinsic size of
     * the tracked element.
     */
    scroller?: T | null;

    /** Whether to round the intrinsic size values to the nearest integer. */
    round?: boolean;

    /**
     * Reset the tracked bounds to zero when the element is removed or unset.
     * Default: `true`.
     */
    reset?: boolean;

    /** Recalculate bounds on window resize. Default: `true`. */
    windowResize?: boolean;

    /** Recalculate bounds on window scroll. Default: `true`. */
    windowScroll?: boolean;
}

/**
 * Tracks the intrinsic size (width and height) of a DOM element and provides an
 * update function to manually refresh the size.
 *
 * @param element The DOM element whose intrinsic size is being tracked.
 * @param param1 The options for tracking the element's intrinsic size.
 * @returns An object containing the element's width, height, and an `update`
 *   function to manually refresh the size.
 */
export function useElementIntrinsicSize<T extends HTMLElement>(
    element: T | null,
    {
        scroller,
        round = false,
        reset = true,
        windowResize = true,
        windowScroll = true,
    }: UseElementIntrinsicSizeOptions<T> = {}
): ElementSize & { update: () => void } {
    const rafRef = useRef<number | null>(null);
    const [rect, setRect] = useState(getEmptySize);

    const update = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        if (!element) {
            if (reset) setRect((prev) => retainOrReplace(prev, getEmptySize()));
            return;
        }

        rafRef.current = requestAnimationFrame(() => {
            const sizes = getElementIntrinsicSize(
                element,
                scroller ?? undefined
            );
            setRect((prev) =>
                retainOrReplace(prev, {
                    width: round ? Math.round(sizes.width) : sizes.width,
                    height: round ? Math.round(sizes.height) : sizes.height,
                })
            );
        });
    }, [element, scroller, round, reset]);

    useIsomorphicLayoutEffect(() => {
        update();
    }, [update]);

    useIsomorphicLayoutEffect(() => {
        if (!element) return;

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(element);

        const mutationObserver = new MutationObserver(update);
        mutationObserver.observe(element, {
            attributes: true,
        });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [element, update]);

    useIsomorphicLayoutEffect(() => {
        if (windowResize)
            window.addEventListener("resize", update, { passive: true });

        if (windowScroll)
            window.addEventListener("scroll", update, {
                capture: true,
                passive: true,
            });

        return () => {
            if (windowResize) window.removeEventListener("resize", update);

            if (windowScroll)
                window.removeEventListener("scroll", update, true);
        };
    }, [windowResize, windowScroll, update]);

    return {
        ...rect,
        update,
    };
}

function getEmptySize(): ElementSize {
    return {
        width: 0,
        height: 0,
    };
}
