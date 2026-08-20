import { useState } from "react";

/**
 * Tracks a value and returns its value from the previous render.
 *
 * @param value The current value to track.
 * @returns The previous value, or `null` on the first render.
 */
export function usePrevious<T>(value: T) {
    const [current, setCurrent] = useState<T | null>(value);
    const [previous, setPrevious] = useState<T | null>(null);

    if (value !== current) {
        setPrevious(current);
        setCurrent(value);
    }

    return previous;
}
