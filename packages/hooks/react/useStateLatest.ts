import {
    useCallback,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";

/**
 * Creates state with a stable getter for its latest value.
 *
 * Use the getter in callbacks, timers, or async code to avoid stale closures.
 *
 * @default undefined
 * @param initialState - Initial state value or a lazy initializer function.
 * @returns A tuple containing the current state, a setter, and a stable getter.
 *   The setter accepts a value or updater function and keeps the getter in
 *   sync.
 */
export function useStateLatest<T>(
    initialState: T | (() => T)
): readonly [T, Dispatch<SetStateAction<T>>, () => T] {
    const [state, setState] = useState(initialState);
    const ref = useRef(state);

    const set = useCallback<Dispatch<SetStateAction<T>>>((value) => {
        setState((prev) => {
            const next =
                typeof value === "function"
                    ? (value as (prev: T) => T)(prev)
                    : value;

            ref.current = next;
            return next;
        });
    }, []);

    const getter = useCallback(() => ref.current, []);

    return [state, set, getter] as const;
}
