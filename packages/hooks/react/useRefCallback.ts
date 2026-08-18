import { useCallback, useState, type RefCallback } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useStableCallback } from "./useStableCallback";

/**
 * Tracks the current ref target and runs an optional attach callback when it
 * changes.
 *
 * @param onAttach Called with the attached value when the ref is set. It may
 *   return a cleanup function to run when the ref changes or unmounts. Default:
 *   none.
 * @returns A stable ref callback and the current attached value.
 *
 *   The returned tuple is `[ref, element]`:
 *
 *   - `ref`: pass it to React as a ref callback.
 *   - `element`: current attached value, or `null` before mount.
 */
export function useRefCallback<T>(
    onAttach?: (el: T) => void | (() => void)
): [RefCallback<T>, T | null] {
    const stableOnAttach = useStableCallback(onAttach);
    const [element, setElement] = useState<T | null>(null);

    const refCallback = useCallback((node: T | null) => {
        setElement(node);
    }, []);

    useIsomorphicLayoutEffect(() => {
        if (!element) return;

        const cleanup = stableOnAttach(element);

        return () => {
            cleanup?.();
        };
    }, [element, stableOnAttach]);

    return [refCallback, element] as const;
}
