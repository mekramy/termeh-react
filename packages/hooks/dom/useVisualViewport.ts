import { useEffect, useRef, useState } from "react";
import { getViewportMetrics, IS_SSR, type ViewportMetrics } from "../../utils";

/**
 * Subscribes to the current visual viewport and returns its latest metrics.
 *
 * Uses `window.visualViewport` when available and falls back to the browser
 * resize event. The value updates on viewport changes and re-renders the hook.
 *
 * @returns The current viewport metrics, including width, height, offset,
 *   scale, and related values. Defaults to the browser viewport metrics when
 *   Visual Viewport is unavailable.
 */
export function useVisualViewport(): ViewportMetrics {
    const rafRef = useRef<number | null>(null);
    const [viewport, setViewport] = useState(getViewportMetrics);

    useEffect(() => {
        if (IS_SSR) return;

        const update = () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

            rafRef.current = requestAnimationFrame(() => {
                setViewport(getViewportMetrics());
            });
        };

        update();

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", update);
            window.visualViewport.addEventListener("scroll", update);
        } else window.addEventListener("resize", update);

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener("resize", update);
                window.visualViewport.removeEventListener("scroll", update);
            } else window.removeEventListener("resize", update);
        };
    }, []);

    return viewport;
}
