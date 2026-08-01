import { useCallback, useRef, useState } from "react";

/**
 * Creates a state value together with a ref that always points to the latest
 * state.
 *
 * The returned ref is updated on every render, making it safe to read the
 * current state from stable callbacks, timers, event listeners, or async
 * operations without stale closures.
 */
/**
 * Creates a state value together with a ref that always points to the latest
 * state, including state updates performed through the returned setter.
 *
 * The ref is updated immediately before scheduling a state update, allowing
 * synchronous code to observe the new value without waiting for the next
 * render.
 */
export function useStateRef<T>(
    initialState: T | (() => T)
): readonly [T, React.Dispatch<React.SetStateAction<T>>, React.RefObject<T>] {
    const [state, setState] = useState(initialState);

    const ref = useRef(state);

    const set = useCallback<React.Dispatch<React.SetStateAction<T>>>(
        (value) => {
            setState((prev) => {
                const next =
                    typeof value === "function"
                        ? (value as (prev: T) => T)(prev)
                        : value;

                ref.current = next;
                return next;
            });
        },
        []
    );

    ref.current = state;

    return [state, set, ref] as const;
}
