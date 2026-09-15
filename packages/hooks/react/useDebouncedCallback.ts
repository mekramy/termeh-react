/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";
import type { Maybe } from "yup";

type DebouncedFunction<T extends (...args: any[]) => any> = ((
    ...args: Parameters<T>
) => ReturnType<T>) & {
    cancel: () => void;
};

/**
 * Debounces a callback and invokes it after a delay.
 *
 * Each call resets the timer, so the callback only runs after the latest
 * invocation has remained idle for the specified delay.
 *
 * @param fn - Function to debounce.
 * @param delayMs - Debounce delay in milliseconds.
 * @returns A debounced function with a `cancel` method to clear the pending
 *   call.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    fn: Maybe<T>,
    delayMs: number
): DebouncedFunction<T> {
    const fnRef = useRef(fn);
    fnRef.current = fn;

    const delayRef = useRef(delayMs);
    delayRef.current = delayMs;

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancel = useCallback(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const debounced = useCallback(
        (...args: Parameters<T>): void => {
            cancel();

            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                fnRef.current?.(...args);
            }, delayRef.current);
        },
        [cancel]
    ) as DebouncedFunction<T>;
    debounced.cancel = cancel;

    useEffect(cancel, [cancel]);

    return debounced;
}
