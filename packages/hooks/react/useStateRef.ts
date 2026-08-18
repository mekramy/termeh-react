import {
    useCallback,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";

/**
 * Creates a state value and a ref that always stays in sync.
 *
 * Useful when callbacks, timers, or async code need the latest value without
 * stale closures.
 *
 * @default initialState undefined
 * @param initialState - Initial state value. If a function is passed, it is
 *   treated as a lazy initializer and called only once on the first render.
 * @returns A tuple of [state, setState, ref]:
 *
 *   - State: current value
 *   - SetState: updates the state and keeps the ref in sync
 *   - Ref: latest value getter
 */
export function useStateRef<T>(
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
