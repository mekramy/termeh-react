import { useRef } from "react";
import isEqual from "react-fast-compare";
import type { Destructor } from "../../utils";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useStableCallback } from "./useStableCallback";

/**
 * Invokes a callback when a value changes by deep comparison.
 *
 * The callback receives the new and previous values.
 */
export function useWatch<T>(
    value: T,
    watcher: (newValue: T, oldValue: T) => Destructor
) {
    const stableWatcher = useStableCallback(watcher);
    const { version, current, previous } = useDeepCompareVersion(value);

    useIsomorphicLayoutEffect(() => {
        return stableWatcher(current, previous);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version, stableWatcher]);
}

function useDeepCompareVersion<T>(value: T): {
    version: number;
    previous: T;
    current: T;
} {
    const stateRef = useRef({ current: value, previous: value, version: 0 });

    if (!isEqual(stateRef.current.current, value)) {
        stateRef.current = {
            current: value,
            previous: stateRef.current.current,
            version: stateRef.current.version + 1,
        };
    }

    return stateRef.current;
}
