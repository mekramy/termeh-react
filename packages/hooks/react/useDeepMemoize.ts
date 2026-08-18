import { useRef } from "react";
import isEqual from "react-fast-compare";

/**
 * Keeps a stable reference to a value while its deep contents remain equal.
 *
 * The hook stores the last value in a ref and updates it only when
 * `react-fast-compare` reports a deep change. This keeps the returned reference
 * stable across renders for objects or arrays that are recreated with the same
 * structure.
 *
 * Use it when you want to avoid unnecessary work in effects, memoized children,
 * or other logic that depends on referential identity.
 *
 * Notes:
 *
 * - Deep equality checks can be expensive for large or deeply nested values.
 * - The hook does not clone values; it returns the previous reference when the
 *   value is deeply equal.
 * - Avoid mutating the input in place, because the hook compares values by
 *   structure, not by mutation history.
 *
 * @param value - The value to memoize. Default: the first value passed to the
 *   hook for the initial render.
 * @returns The latest value with a stable reference while the deep contents
 *   remain equal; otherwise, the current value is stored and returned.
 */
export function useDeepMemoize<T>(value: T): T {
    const ref = useRef<T>(value);

    if (!isEqual(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}
