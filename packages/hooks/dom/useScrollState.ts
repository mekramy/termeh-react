import { useCallback, useState } from "react";
import { getScrollState, retainOrReplace, type ScrollState } from "../../utils";
import { useDebouncedCallback, useStableCallback, useWatch } from "../react";
import {
    useLayoutWatch,
    type LayoutWatchCallback,
    type LayoutWatchSource,
} from "./useLayoutWatch";

/** Supported scroll event observers. */
type ScrollObserver = "scroll" | "resize" | "mutation";

interface ScrollStateOptions {
    /**
     * The debounce delay in milliseconds for updating the scroll state.
     *
     * @default 100
     */
    debounce: number;

    /**
     * Pixel threshold used for edge detection.
     *
     * @default 0
     */
    threshold: number;

    /**
     * Scroll observers to attach.
     *
     * @default ["scroll", "resize", "mutation"]
     */
    observers: ScrollObserver[];

    /** The media queries that should be watched for viewport changes. */
    mediaQueries: string[];
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
        debounce = 100,
        threshold = 0,
        observers = ["scroll", "resize", "mutation"],
        mediaQueries,
    }: Partial<ScrollStateOptions> = {}
): ScrollState & { update: () => void } {
    const [empty] = useState(getEmptyState);
    const [state, setState] = useState(getEmptyState);

    const onChange = useStableCallback<LayoutWatchCallback>((source) => {
        const el = source === "unmount" ? null : element;

        if (!el) setState((prev) => retainOrReplace(prev, empty));
        else
            setState((prev) =>
                retainOrReplace(prev, getScrollState(el, threshold))
            );
    });

    const update = useCallback(() => {
        onChange("mount");
    }, [onChange]);

    const watch: LayoutWatchSource[] = [
        observers.includes("resize") && "resize",
        observers.includes("mutation") && "mutation",
    ].filter(Boolean) as LayoutWatchSource[];
    useLayoutWatch(element, onChange, {
        watch,
        debounce,
        mediaQueries,
    });

    const handleScroll = useDebouncedCallback(update, debounce);
    useWatch(
        [element, observers.includes("scroll")] as const,
        ([el, isObserved]) => {
            if (!el) return;

            if (isObserved)
                el.addEventListener("scroll", handleScroll, {
                    passive: true,
                });

            return () => {
                if (isObserved) el.removeEventListener("scroll", handleScroll);
            };
        }
    );

    return {
        ...state,
        update,
    };
}

function getEmptyState(): ScrollState {
    return getScrollState(document.createElement("div"));
}
