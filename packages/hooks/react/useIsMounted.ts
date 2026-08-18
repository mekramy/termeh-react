import { useCallback, useEffect, useRef, type EffectCallback } from "react";
import { useStableCallback } from "./useStableCallback";

/**
 * Tracks whether the component is mounted.
 *
 * Useful for guarding async work and avoiding updates after unmount.
 *
 * @param effect Optional effect to run on mount and clean up on unmount.
 *   Defaults to undefined, so no additional effect is registered.
 * @returns A stable callback that returns the current mounted state.
 */
export function useIsMounted(effect?: EffectCallback): () => boolean {
    const stableEffect = useStableCallback(effect);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        const callback = stableEffect();

        return () => {
            isMountedRef.current = false;
            callback?.();
        };
    }, [stableEffect]);

    return useCallback(() => isMountedRef.current, []);
}
