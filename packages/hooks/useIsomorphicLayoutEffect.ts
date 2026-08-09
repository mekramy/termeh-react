import { useEffect, useLayoutEffect } from "react";
import { IS_SSR } from "../utils";

/**
 * Like useLayoutEffect, but safe for SSR — falls back to useEffect on the
 * server.
 */
export const useIsomorphicLayoutEffect = IS_SSR ? useEffect : useLayoutEffect;
