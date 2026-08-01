import { useRef, type RefObject } from "react";

/**
 * Returns a ref that always points to the latest value without causing callback
 * or effect dependencies to change.
 *
 * Useful for reading the current value inside stable callbacks, timers, event
 * listeners, or async operations without recreating them.
 */
export function useLatest<T>(value: T): RefObject<T> {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}
