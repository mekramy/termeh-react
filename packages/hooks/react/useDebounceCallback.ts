import { useEffect } from "react";
import { useStableCallback } from "./useStableCallback";

/**
 * Debounces a value and runs a callback after the delay.
 *
 * The callback receives the latest value only after the value has remained
 * unchanged for the specified delay.
 *
 * @param value - The latest value to observe.
 * @param delay - The debounce delay in milliseconds. Default: 0.
 * @param callback - Function called with the latest value after the delay.
 */
export function useDebounceCallback<T>(
    value: T,
    delay: number,
    callback: (v: T) => void
) {
    const callbackFn = useStableCallback(callback);

    useEffect(() => {
        const handler = setTimeout(() => callbackFn(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay, callbackFn]);
}
