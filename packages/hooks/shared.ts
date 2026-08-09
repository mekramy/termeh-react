import { useEffect, useLayoutEffect } from "react";
import { IS_SSR } from "../utils";

/**
 * Like useLayoutEffect, but safe for SSR — falls back to useEffect on the
 * server.
 */
export const useIsomorphicLayoutEffect = IS_SSR ? useEffect : useLayoutEffect;

/** Represents the visual viewport metrics including dimensions and zoom scale. */
export interface ViewportMetrics {
    /** Visual viewport width in CSS pixels. */
    width: number;

    /** Visual viewport height in CSS pixels. */
    height: number;

    /** Current visual viewport zoom scale. */
    scale: number;
}
