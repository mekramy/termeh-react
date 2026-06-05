/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Like useLayoutEffect, but safe for SSR — falls back to useEffect on the
 * server.
 */
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Returns a stable callback that always calls the latest version of fn.
 *
 * @example
 *     const onClick = useEvent(() => {
 *         console.log(count);
 *     });
 *
 *     addEventListener("click", onClick);
 */
export function useEvent<T extends (...args: any[]) => any>(fn: T): T {
    const fnRef = useRef(fn);

    useIsomorphicLayoutEffect(() => {
        fnRef.current = fn;
    });

    return useCallback(
        ((...args: Parameters<T>): ReturnType<T> => {
            return fnRef.current(...args);
        }) as T,
        []
    );
}
