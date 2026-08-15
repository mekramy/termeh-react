import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Hook that runs an effect only once when the ready condition becomes true.
 *
 * @param ready - Condition that determines when the effect should run
 * @param effect - Function to run once, optionally returning a cleanup function
 */
export function useRunOnce(
    ready: boolean,
    effect: () => void | (() => void)
): void {
    const mounted = useRef(false);

    useIsomorphicLayoutEffect(() => {
        if (!mounted.current && ready) {
            mounted.current = true;
            return effect();
        }
    }, [ready, effect]);
}
