import { useEffect, useRef, useState } from "react";
import { getViewportMetrics, IS_SSR, type ViewportMetrics } from "../utils";

/**
 * A React hook to track the visual viewport dimensions and scale.
 *
 * @returns The current viewport metrics and updates on resize.
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
