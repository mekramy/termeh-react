import { useCallback, useRef } from "react";

/**
 * Returns a stable getter that always reads the latest value.
 *
 * Useful when a callback or async flow needs the newest value without
 * re-creating the function or adding extra dependencies.
 *
 * @param value - The value to keep in sync. On the first render, this becomes
 *   the initial ref value and is used as the default `current` value.
 * @returns A stable function that returns the latest `value` via `ref.current`.
 */
export function useLatest<T>(value: T): () => T {
    const ref = useRef(value);
    ref.current = value;

    return useCallback(() => ref.current, []);
}
