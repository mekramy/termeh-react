import { useRef } from "react";
import isEqual from "react-fast-compare";

/**
 * Memoizes a value using deep equality to preserve its reference between
 * renders.
 *
 * The returned reference is updated only when the value differs from the
 * previous one according to a deep comparison.
 *
 * @param value - The value to memoize.
 * @returns The latest value with a stable reference while its contents remain
 *   deeply equal.
 */
export function useMemoize<T>(value: T): T {
    const ref = useRef<T>(value);

    if (!isEqual(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}
