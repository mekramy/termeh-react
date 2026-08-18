import { useEffect, useLayoutEffect } from "react";
import { IS_SSR } from "../../utils";

/**
 * Safe SSR-friendly version of `useLayoutEffect`.
 *
 * Uses `useLayoutEffect` in the browser and falls back to `useEffect` on the
 * server to avoid SSR warnings and invalid hook usage.
 *
 * @returns The correct effect hook for the current environment.
 *
 *   - Client: `useLayoutEffect`
 *   - Server: `useEffect`
 */
export const useIsomorphicLayoutEffect = IS_SSR ? useEffect : useLayoutEffect;
