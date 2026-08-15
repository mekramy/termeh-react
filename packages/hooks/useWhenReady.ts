import { useRef, type EffectCallback } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useStableCallback } from "./useStableCallback";

/**
 * Hook that runs an effect only once when the ready condition becomes true.
 *
 * @param ready - Condition that determines when the effect should run
 * @param effect - Function to run once, optionally returning a cleanup function
 * @returns Reference to the mounted state
 */
export function useWhenReady(ready: boolean, effect: EffectCallback) {
    const mountedRef = useRef(false);
    const effectRef = useStableCallback(effect);

    useIsomorphicLayoutEffect(() => {
        if (!mountedRef.current && ready) {
            mountedRef.current = true;
            const callback = effectRef();

            return () => {
                mountedRef.current = false;
                callback?.();
            };
        }
    }, [ready, effectRef]);

    return mountedRef;
}
