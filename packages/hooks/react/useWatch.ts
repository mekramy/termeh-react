import { useRef } from "react";
import isEqual from "react-fast-compare";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useStableCallback } from "./useStableCallback";

/**
 * Watches a value and invokes the callback when it changes. Values can be
 * primitive, array or object.
 *
 * The callback receives both the new and previous values and always uses the
 * latest callback reference without triggering the watcher itself.
 *
 * Values are compared using deep equality.
 */
export function useWatch<T>(
    value: T,
    watcher: (newValue: T, oldValue: T) => void
) {
    const previous = useRef(value);
    const stableWatcher = useStableCallback(watcher);

    useIsomorphicLayoutEffect(() => {
        if (isEqual(previous.current, value)) return;

        const oldValue = previous.current;
        previous.current = value;

        stableWatcher(value, oldValue);
    }, [value, stableWatcher]);
}
