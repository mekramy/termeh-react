import { useCallback, useRef } from "react";
import isEqual from "react-fast-compare";

/**
 * Deeply memoizes a value and provides a stable getter for accessing its latest
 * reference.
 *
 * The memoized value is updated only when a deep comparison detects a change,
 * while the getter maintains a stable reference across renders.
 *
 * @param value - The value to memoize.
 * @returns A tuple containing the deeply memoized value and a stable getter for
 *   it.
 */
export function useMemoizeLatest<T>(value: T): readonly [T, () => T] {
    const ref = useRef(value);

    if (!isEqual(ref.current, value)) {
        ref.current = value;
    }

    const latest = useCallback(() => ref.current, []);

    return [ref.current, latest] as const;
}
