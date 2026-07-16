import { useEffect, useLayoutEffect } from "react";

/**
 * Like useLayoutEffect, but safe for SSR — falls back to useEffect on the
 * server.
 */
export const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
