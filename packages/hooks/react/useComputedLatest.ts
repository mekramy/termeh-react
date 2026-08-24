import { useCallback, useRef, type DependencyList } from "react";
import isEqual from "react-fast-compare";

/**
 * Memoizes a computed value based on a deeply compared dependency list and
 * provides a stable getter for accessing its latest value.
 *
 * The factory is re-executed only when the dependencies differ from the
 * previous ones according to a deep comparison. The returned getter remains
 * stable across renders while always returning the latest computed value.
 *
 * @param factory - A function that computes the value.
 * @param deps - The dependencies that determine when the value is recomputed.
 * @returns A tuple containing the computed value and a stable getter for its
 *   latest value.
 */
export function useComputedLatest<T>(
    factory: () => T,
    deps: DependencyList
): readonly [T, () => T] {
    const depsRef = useRef(deps);
    const computedRef = useRef<T>(factory());

    if (!isEqual(depsRef.current, deps)) {
        depsRef.current = deps;
        computedRef.current = factory();
    }

    const latest = useCallback(() => computedRef.current, []);

    return [computedRef.current, latest] as const;
}
