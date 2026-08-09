"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
    getElementBounding,
    retainOrReplace,
    type ElementRect,
} from "../utils";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface UseElementBoundingOptions {
    /**
     * Reset values to 0 on component unmounted
     *
     * @default true
     */
    reset?: boolean;

    /**
     * Listen to window resize event
     *
     * @default true
     */
    windowResize?: boolean;
    /**
     * Listen to window scroll event
     *
     * @default true
     */
    windowScroll?: boolean;
}

/**
 * A React hook to track the bounding rectangle of a DOM element. It uses
 * ResizeObserver, MutationObserver, and window events for robustness.
 *
 * @param element - A reference to the HTML element.
 * @param options - Configuration options for reset and observers.
 * @returns An object containing the current bounding rect and an `update`
 *   function.
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
    const [rect, setRect] = useState<ElementRect>(() => getEmptyBounding());

    // Update function to compute and set the element bounding
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

    // This ensures that the bounding rect is recalculated whenever the element changes.
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
            attributeFilter: ["style", "class"],
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

    return useMemo(
        () => ({
            ...rect,
            update,
        }),
        [rect, update]
    );
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
