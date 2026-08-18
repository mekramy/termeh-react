/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from "react";

/**
 * Returns a callback with a stable identity that always calls the latest `fn`.
 *
 * Use this for event handlers and subscriptions that should keep the same
 * reference across renders without re-registering listeners.
 *
 * @param fn - Callback to wrap. Accepts `null` or `undefined` and defaults to
 *   `undefined`. When omitted, the returned callback does nothing.
 * @returns A stable callback with the same signature as `fn`. Calling it
 *   invokes the latest version of `fn` with the provided arguments.
 */
export function useStableCallback<T extends (...args: any[]) => any>(
    fn: T | null | undefined
): T {
    const fnRef = useRef(fn);
    fnRef.current = fn;

    return useCallback(
        ((...args: Parameters<T>): ReturnType<T> => {
            return fnRef.current?.(...args);
        }) as T,
        []
    );
}
