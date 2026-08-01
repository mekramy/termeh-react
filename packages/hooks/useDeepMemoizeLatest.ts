import { useRef, type RefObject } from "react";
import isEqual from "react-fast-compare";

/**
 * Returns a deeply memoized value together with a ref pointing to it.
 *
 * The returned value keeps a stable reference until it changes according to a
 * deep equality comparison. The returned ref always points to the same stable
 * value, making it ideal for reading the latest value inside stable callbacks,
 * event handlers, timers, or async operations without recreating them.
 */
export function useDeepMemoizeLatest<T>(value: T): readonly [T, RefObject<T>] {
    const ref = useRef(value);

    if (!isEqual(ref.current, value)) {
        ref.current = value;
    }

    return [ref.current, ref] as const;
}
