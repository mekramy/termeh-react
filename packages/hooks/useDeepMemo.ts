import { useRef } from "react";
import isEqual from "react-fast-compare";

/**
 * Return a stable reference to a value by updating it only when a deep equality
 * comparison indicates a change.
 *
 * This hook stores the last seen value in a ref and uses a deep-equality check
 * (isEqual) to decide whether to replace the stored value with the incoming
 * one. Because it uses a ref it does not trigger React re-renders; instead it
 * preserves referential identity across renders when the deep contents of the
 * value are unchanged.
 *
 * Use this hook when you need a stable reference for objects or arrays that may
 * be recreated on each render but are deeply equal to the previous value (for
 * example to avoid unnecessary effects or to provide stable props to memoized
 * children).
 *
 * Important notes:
 *
 * - Deep equality checks can be expensive for large or deeply-nested values.
 *   Measure and consider alternative approaches if performance is a concern.
 * - This hook does not clone values. It returns the same reference that was
 *   passed previously when the deep contents are equal.
 * - Avoid mutating the passed-in value in place. In-place mutations can lead to
 *   surprising results because the hook relies on comparing the incoming value
 *   with the previously stored value.
 *
 * @example
 *     ```tsx
 *     const config = useDeepMemo({ timeout: 500, retries: 3 });
 *     // `config` will keep the same reference between renders as long as its
 *     // deep contents do not change.
 *     ```
 *
 * @typeParam T - Type of the value to memoize.
 * @param value - The value to keep referentially stable when deeply equal.
 * @returns The memoized value; the returned reference is stable across renders
 *   while the deep-equality of the value remains true.
 */
export function useDeepMemo<T>(value: T): T {
    const ref = useRef<T>(value);

    if (!isEqual(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
}
