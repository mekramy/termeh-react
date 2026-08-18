"use client";

import { useCallback, useRef, useState } from "react";
import {
    getElementBounding,
    retainOrReplace,
    type ElementRect,
} from "../../utils";
import { useIsomorphicLayoutEffect } from "../react";

export interface UseElementBoundingOptions {
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
 * Tracks the bounding box of a DOM element and refreshes it when the element,
 * its styles, or the viewport changes.
 *
 * @param element - The element to measure.
 * @param options - Tracking behavior options.
 * @returns The current bounds and an `update` function that forces a refresh.
 */
export function useElementBounding<T extends HTMLElement>(
    element: T | null,
    {
        reset = true,
        windowResize = true,
        windowScroll = true,
    }: UseElementBoundingOptions = {}
): ElementRect & { update: () => void } {
    const rafRef = useRef<number | null>(null);
    const [rect, setRect] = useState(getEmptyBounding);

    const update = useCallback(() => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

        if (!element) {
            if (reset)
                setRect((prev) => retainOrReplace(prev, getEmptyBounding()));
            return;
        }

        rafRef.current = requestAnimationFrame(() => {
            setRect((prev) =>
                retainOrReplace(prev, getElementBounding(element))
            );
        });
    }, [element, reset]);

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

function getEmptyBounding(): ElementRect {
    return {
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        get centerX() {
            return 0;
        },
        get centerY() {
            return 0;
        },
    };
}
