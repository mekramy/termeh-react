"use client";

import { useCallback, useState } from "react";
import {
    getElementClipping,
    retainOrReplace,
    type Clipping,
} from "../../utils";
import { useStableCallback } from "../react";
import {
    useLayoutWatch,
    type LayoutWatchCallback,
    type LayoutWatchSource,
} from "./useLayoutWatch";

export interface UseElementClippingOptions {
    /**
     * Debounce delay in milliseconds for clipping updates.
     *
     * @default 100
     */
    debounce: number;

    /**
     * Reset clipping to all `false` when the element is removed.
     *
     * @default true
     */
    reset?: boolean;

    /**
     * Recalculate clipping when the window is resized.
     *
     * @default true
     */
    windowResize?: boolean;

    /**
     * Recalculate clipping when the window is scrolled.
     *
     * @default true
     */
    windowScroll?: boolean;

    /** Media queries to watch for viewport changes. */
    mediaQueries: string[];
}

/**
 * Tracks whether an element is clipped by the viewport or scrollable ancestors.
 *
 * @param element Element to check for clipping.
 * @param options Tracking options.
 * @returns Clipping state and an `update` function that forces a refresh.
 */
export function useElementClipping<T extends HTMLElement>(
    element: T | null,
    {
        debounce = 100,
        reset = true,
        windowResize = true,
        windowScroll = true,
        mediaQueries,
    }: Partial<UseElementClippingOptions> = {}
): Clipping & { update: () => void } {
    const [empty] = useState(getEmptyClipping);
    const [clipping, setClipping] = useState(getEmptyClipping);

    const onChange = useStableCallback<LayoutWatchCallback>((source) => {
        const el = source === "unmount" ? null : element;

        if (!el && reset) setClipping((prev) => retainOrReplace(prev, empty));
        else if (el)
            setClipping((prev) =>
                retainOrReplace(prev, getElementClipping(el))
            );
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
        ...clipping,
        update,
    };
}

function getEmptyClipping(): Clipping {
    return {
        isClippedTop: false,
        isClippedBottom: false,
        isClippedLeft: false,
        isClippedRight: false,
    };
}
