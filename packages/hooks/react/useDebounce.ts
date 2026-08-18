import { useEffect, useState } from "react";

/**
 * Returns a debounced version of a value.
 *
 * The returned value updates only after the input has remained unchanged for
 * the specified delay time.
 *
 * @param value - The value to debounce.
 * @param delay - Delay in milliseconds before the debounced value updates.
 * @returns The debounced value. It updates only after the delay has passed
 *   without a new value change.
 */
export function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
