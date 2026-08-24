import { useRef, type DependencyList } from "react";
import isEqual from "react-fast-compare";

/**
 * Memoizes a computed value based on a deeply compared dependency list.
 *
 * The factory is re-executed only when the dependencies differ from the
 * previous ones according to a deep comparison.
 *
 * @param factory - A function that computes the value.
 * @param deps - The dependencies that determine when the value is recomputed.
 * @returns The memoized computed value.
 */
export function useComputed<T>(factory: () => T, deps: DependencyList): T {
    const depsRef = useRef(deps);
    const computedRef = useRef<T>(factory());

    if (!isEqual(depsRef.current, deps)) {
        depsRef.current = deps;
        computedRef.current = factory();
    }

    return computedRef.current;
}
