import { useCallback, useRef } from "react";
import isEqual from "react-fast-compare";

/**
 * Returns the latest value as a deeply memoized reference and a stable getter.
 *
 * The stored value stays unchanged until a deep equality check detects a new
 * value. This keeps the latest value available to stable callbacks, timers, and
 * async flows without recreating those closures.
 *
 * @param value - The current value to memoize. Defaults to the first value
 *   passed on the initial render.
 * @returns A tuple with:
 *
 *   - The latest stable value
 *   - A getter that always returns the current stable value
 */
export function useDeepMemoizeLatest<T>(value: T): readonly [T, () => T] {
    const ref = useRef(value);

    if (!isEqual(ref.current, value)) {
        ref.current = value;
    }

    const latest = useCallback(() => ref.current, []);

    return [ref.current, latest] as const;
}
