"use client";

import { useCallback, useState } from "react";
import {
    getRealElementSize,
    retainOrReplace,
    type ElementSize,
    type Prettify,
} from "../../utils";
import { useStableCallback } from "../react";
import {
    useLayoutWatch,
    type LayoutWatchCallback,
    type LayoutWatchSource,
} from "./useLayoutWatch";

export interface UseRealElementSizeOptions {
    /**
     * Debounce delay (ms) before applying size updates.
     *
     * @default 100
     */
    debounce: number;

    /**
     * Resets tracked size to `{ width: 0, height: 0 }` when the element is
     * removed or unset.
     *
     * @default true
     */
    reset?: boolean;

    /** Recalculates size on window resize events. @default true */
    windowResize?: boolean;

    /** Recalculates size on window scroll events. @default true */
    windowScroll?: boolean;

    /** Media queries to watch for viewport-driven size changes. */
    mediaQueries: string[];
}

/**
 * Tracks an element's intrinsic size (`width`, `height`) and exposes a manual
 * `update` trigger.
 *
 * @param element Target DOM element to measure.
 * @param options Optional tracking configuration.
 * @returns Current size and an `update` function to force re-measurement.
 */
export function useRealElementSize<T extends HTMLElement>(
    element: T | null,
    {
        debounce = 100,
        reset = true,
        windowResize = true,
        windowScroll = true,
        mediaQueries,
    }: Partial<UseRealElementSizeOptions> = {}
): Prettify<ElementSize> & { update: () => void } {
    const [empty] = useState(getEmptySize);
    const [rect, setRect] = useState(getEmptySize);

    const onChange = useStableCallback<LayoutWatchCallback>((source) => {
        const el = source === "unmount" ? null : element;

        if (!el && reset) setRect((prev) => retainOrReplace(prev, empty));
        else if (el)
            setRect((prev) => retainOrReplace(prev, getRealElementSize(el)));
    });

    const update = useCallback(() => {
        onChange("mount");
    }, [onChange]);

    const watch: LayoutWatchSource[] = [
        "resize",
        "mutation",
        windowScroll && "scroll",
        windowResize && "windowResize",
    ].filter(Boolean) as LayoutWatchSource[];
    useLayoutWatch(element, onChange, {
        watch,
        debounce,
        mediaQueries,
    });

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
