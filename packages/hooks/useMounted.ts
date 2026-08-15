import { useRef, type EffectCallback } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useStableCallback } from "./useStableCallback";

/**
 * Hook that executes an effect only once after the component has mounted.
 *
 * @param effect - A callback function to run on mount. Can optionally return a
 *   cleanup function.
 */
export function useMounted(effect: EffectCallback) {
    const mountedRef = useRef(false);
    const effectRef = useStableCallback(effect);

    useIsomorphicLayoutEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            const callback = effectRef();

            return () => {
                mountedRef.current = false;
                callback?.();
            };
        }
    }, [effectRef]);

    return mountedRef;
}
