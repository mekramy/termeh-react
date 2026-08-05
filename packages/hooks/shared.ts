import { useEffect, useLayoutEffect } from "react";

/**
 * Like useLayoutEffect, but safe for SSR — falls back to useEffect on the
 * server.
 */
export const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Represents the visual viewport metrics including dimensions and zoom scale. */
export interface ViewportMetrics {
    /** Visual viewport width in CSS pixels. */
    width: number;

    /** Visual viewport height in CSS pixels. */
    height: number;

    /** Current visual viewport zoom scale. */
    scale: number;
}
