import { useEffect } from "react";
import { useStableCallback } from "./useStableCallback";

/**
 * Runs a cleanup callback when the component unmounts.
 *
 * This hook keeps the provided callback stable across renders and invokes it
 * once during unmount.
 *
 * @param callback - Cleanup logic to run on unmount.
 */
export function useOnUnmount(callback: () => void): void {
    const stableCallback = useStableCallback(callback);

    useEffect(() => {
        return () => {
            stableCallback();
        };
    }, [stableCallback]);
}
