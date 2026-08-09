/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Returns a stable callback that always calls the latest version of fn.
 *
 * @example
 *     const onClick = useStableCallback(() => {
 *         console.log(count);
 *     });
 *
 *     addEventListener("click", onClick);
 */
export function useStableCallback<T extends (...args: any[]) => any>(
    fn: T | null
): T {
    const fnRef = useRef(fn);

    useIsomorphicLayoutEffect(() => {
        fnRef.current = fn;
    });

    return useCallback(
        ((...args: Parameters<T>): ReturnType<T> => {
            return fnRef.current?.(...args);
        }) as T,
        []
    );
}
