import { useCallback, useMemo, useState } from "react";
import { useIsomorphicLayoutEffect } from "./shared";

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

export interface ElementRect {
    x: number;
    y: number;

    top: number;
    right: number;
    bottom: number;
    left: number;

    width: number;
    height: number;

    readonly centerX: number;
    readonly centerY: number;

    update: () => void;
}

/** Reactive bounding box of an HTML element. */
export function useElementBounding<T extends HTMLElement>(
    element: T | null,
    {
        reset = true,
        windowResize = true,
        windowScroll = true,
    }: UseElementBoundingOptions = {}
) {
    const [rect, setRect] = useState({
        x: 0,
        y: 0,

        top: 0,
        right: 0,
        bottom: 0,
        left: 0,

        width: 0,
        height: 0,
    });

    const update = useCallback(() => {
        if (!element) {
            if (reset) {
                setRect((prev) => {
                    if (
                        prev.x === 0 &&
                        prev.y === 0 &&
                        prev.top === 0 &&
                        prev.right === 0 &&
                        prev.bottom === 0 &&
                        prev.left === 0 &&
                        prev.width === 0 &&
                        prev.height === 0
                    ) {
                        return prev;
                    }

                    return {
                        x: 0,
                        y: 0,

                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,

                        width: 0,
                        height: 0,
                    };
                });
            }

            return;
        }

        const next = element.getBoundingClientRect();
        setRect((prev) => {
            if (
                prev.x === next.x &&
                prev.y === next.y &&
                prev.top === next.top &&
                prev.right === next.right &&
                prev.bottom === next.bottom &&
                prev.left === next.left &&
                prev.width === next.width &&
                prev.height === next.height
            ) {
                return prev;
            }

            return {
                x: next.x,
                y: next.y,

                top: next.top,
                right: next.right,
                bottom: next.bottom,
                left: next.left,

                width: next.width,
                height: next.height,
            };
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

            get centerX() {
                return rect.left + rect.width / 2;
            },

            get centerY() {
                return rect.top + rect.height / 2;
            },

            update,
        }),
        [rect, update]
    );
}
