"use client";

import { useCallback, useState } from "react";
import {
    getElementBounding,
    retainOrReplace,
    type ElementRect,
    type Prettify,
} from "../../utils";
import { useStableCallback } from "../react";
import {
    useLayoutWatch,
    type LayoutWatchCallback,
    type LayoutWatchSource,
} from "./useLayoutWatch";

export interface UseElementBoundingOptions {
    /**
     * The debounce delay in milliseconds for updating the element's bounding
     * box.
     *
     * @default 100
     */
    debounce: number;

    /**
     * Reset the tracked bounds to zero when the element is removed or unset.
     * Default: `true`.
     */
    reset: boolean;

    /** Recalculate bounds on window resize. Default: `true`. */
    windowResize: boolean;

    /** Recalculate bounds on window scroll. Default: `true`. */
    windowScroll: boolean;

    /** The media queries that should be watched for viewport changes. */
    mediaQueries: string[];
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
        debounce = 100,
        reset = true,
        windowResize = true,
        windowScroll = true,
        mediaQueries,
    }: Partial<UseElementBoundingOptions> = {}
): Prettify<ElementRect> & { update: () => void } {
    const [empty] = useState(getEmptyBounding);
    const [rect, setRect] = useState(getEmptyBounding);

    const onChange = useStableCallback<LayoutWatchCallback>((source) => {
        const el = source === "unmount" ? null : element;

        if (!el && reset) setRect((prev) => retainOrReplace(prev, empty));
        else if (el)
            setRect((prev) => retainOrReplace(prev, getElementBounding(el)));
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
