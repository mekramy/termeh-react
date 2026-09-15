"use client";

import { useRef } from "react";
import { isNotAvailable, type Maybe } from "../../utils";
import {
    useIsomorphicLayoutEffect,
    useStableCallback,
    useWatch,
} from "../react";

const DEFAULT_MUTATION_OPTIONS: MutationObserverInit = {
    attributes: true,
    attributeFilter: ["style", "class"],
    childList: true,
    subtree: true,
};

/** Event sources that can be enabled with `useLayoutWatch`. */
export type LayoutWatchSource =
    "resize" | "mutation" | "scroll" | "windowResize";

/** Event and lifecycle sources reported to the callback. */
export type LayoutWatchCallbackSource =
    LayoutWatchSource | "mediaQuery" | "mount" | "unmount";

export type LayoutWatchCallback = (source: LayoutWatchCallbackSource) => void;

export interface UseLayoutWatchOptions {
    /**
     * Sources to observe on the element or window. The `resize` source uses a
     * `ResizeObserver`; `mutation` uses a `MutationObserver`; `scroll` and
     * `windowResize` listen on `window`. The `scroll` source uses the capture
     * phase by default, so it can also observe scrolling ancestor containers;
     * use `capture` to change this behavior. Use `passive` to control whether
     * window event listeners are passive.
     *
     * @default ["resize"]
     */
    watch: LayoutWatchSource[];

    /**
     * Debounce delay in milliseconds. Positive values wait until events have
     * stopped for the specified duration, then schedule the callback through
     * `requestAnimationFrame`. Values less than or equal to `0` schedule the
     * callback immediately through `requestAnimationFrame`.
     *
     * @default 0
     */
    debounce: number;

    /**
     * Whether the `scroll` source uses the capture phase. Capture is useful for
     * observing scroll events from ancestor scrolling containers.
     *
     * @default true
     */
    capture: boolean;

    /**
     * Whether window event listeners are passive.
     *
     * @default true
     */
    passive: boolean;

    /**
     * Media queries to observe for viewport changes. Every query is registered
     * with `matchMedia`; a non-empty array enables this source independently of
     * `watch`.
     */
    mediaQueries: string[];

    /** Options forwarded to `ResizeObserver.observe`. */
    resizeOptions: ResizeObserverOptions;

    /** Options forwarded to `MutationObserver.observe`. */
    mutationOptions: MutationObserverInit;
}

/**
 * Watches an element and optionally the window for resize, mutation, scroll,
 * and media-query changes. Events are coalesced through `requestAnimationFrame`
 * and can be delayed with `debounce`. The callback also receives `mount` and
 * `unmount` lifecycle events, together with the current or observed element.
 *
 * @param element The element to observe, or `null`/`undefined`.
 * @param callback Called with the layout event source and associated element.
 * @param options Watch sources, debounce settings, media queries, and observer
 *   options. Resize watching is enabled by default.
 */
export function useLayoutWatch<T extends Element>(
    element: Maybe<T>,
    callback: LayoutWatchCallback,
    {
        watch = ["resize"],
        debounce = 0,
        capture = true,
        passive = true,
        mediaQueries,
        resizeOptions,
        mutationOptions = DEFAULT_MUTATION_OPTIONS,
    }: Partial<UseLayoutWatchOptions> = {}
): void {
    const mounted = useRef(false);
    const rafRef = useRef<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stableCallback = useStableCallback(callback);

    /**
     * Stable callback for invoking the resize observer callback with
     * requestAnimationFrame, optionally debounced.
     */
    const caller = useStableCallback<LayoutWatchCallback>((source) => {
        if (!mounted.current) return;

        const invoke = () => {
            if (isNotAvailable(requestAnimationFrame)) {
                stableCallback(source);
                return;
            }

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;

                if (!mounted.current) return;
                stableCallback(source);
            });

            timeoutRef.current = null;
        };

        if (debounce > 0) {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            timeoutRef.current = setTimeout(invoke, debounce);
        } else {
            invoke();
        }
    });

    /** Lifecycle management for mount and unmount events. */
    useIsomorphicLayoutEffect(() => {
        mounted.current = true;
        stableCallback("mount");

        return () => {
            mounted.current = false;

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            stableCallback("unmount");
        };
    }, [element, stableCallback]);

    /** Watch element resize */
    useWatch(
        [element, watch.includes("resize")] as const,
        ([el, isObserved]) => {
            if (!el || !isObserved || isNotAvailable(ResizeObserver)) return;

            const handler = () => caller("resize");
            const observer = new ResizeObserver(handler);
            observer.observe(el, resizeOptions);
            return () => observer.disconnect();
        }
    );

    /** Watch element mutations */
    useWatch(
        [element, watch.includes("mutation")] as const,
        ([el, isObserved]) => {
            if (!el || !isObserved || isNotAvailable(MutationObserver)) return;

            const handler = () => caller("mutation");
            const observer = new MutationObserver(handler);
            observer.observe(el, mutationOptions);
            return () => observer.disconnect();
        }
    );

    /** Watch window resize events */
    useWatch(watch.includes("windowResize"), (isObserved) => {
        if (!isObserved || isNotAvailable(window)) return;

        const handler = () => caller("windowResize");
        window.addEventListener("resize", handler, { passive });
        return () => window.removeEventListener("resize", handler);
    });

    /** Watch window scroll events */
    useWatch(watch.includes("scroll"), (isObserved) => {
        if (!isObserved || isNotAvailable(window)) return;

        const handler = () => caller("scroll");
        window.addEventListener("scroll", handler, {
            capture,
            passive,
        });
        return () => window.removeEventListener("scroll", handler, capture);
    });

    useWatch(mediaQueries, (queries) => {
        if (
            !queries?.length ||
            isNotAvailable(window) ||
            isNotAvailable(window.matchMedia)
        )
            return;

        const handler = () => caller("mediaQuery");
        const mqs = queries.map((q) => window.matchMedia(q));
        mqs.forEach((mql) => mql.addEventListener("change", handler));
        return () => {
            mqs.forEach((mql) => mql.removeEventListener("change", handler));
        };
    });
}
