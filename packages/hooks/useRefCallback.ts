import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Like useLayoutEffect, but safe for SSR — falls back to useEffect on the
 * server.
 */
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A universal ref hook that tracks a DOM node or any custom ref target
 * reactively. Supports automatic cleanup when the element changes or unmounts.
 *
 * @example
 *     const [ref, el] = useRefCallback<HTMLDivElement>((node) => {
 *     console.log("Mounted:", node);
 *     return () => console.log("Unmounted:", node);
 *     });
 *
 *     return <div ref={ref} />;
 *
 * @template T - Type of the element or object being referenced.
 * @param onAttach - Optional function called when the element is attached. Can
 *   return a cleanup function that runs on unmount or ref change.
 * @returns {undefined} RefCallback, currentElement
 */
export function useRefCallback<T>(onAttach?: (el: T) => void | (() => void)) {
    const [element, setElement] = useState<T | null>(null);

    // stable ref callback for React
    const refCallback = useCallback((node: T | null) => {
        setElement(node);
    }, []);

    // handle mount/unmount + cleanup if onAttach provided
    useIsomorphicLayoutEffect(() => {
        if (!element) return;

        const cleanup = onAttach?.(element);

        return () => {
            if (typeof cleanup === "function") cleanup();
        };
    }, [element, onAttach]);

    return [refCallback, element] as const;
}
