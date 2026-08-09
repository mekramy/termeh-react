import { useEffect, useState } from "react";
import { IS_SSR } from "../utils";
import type { ViewportMetrics } from "./shared";

/**
 * Returns the visual viewport dimensions and scale.
 *
 * @returns The visual viewport dimensions and scale.
 */
export function useVisualViewport(): ViewportMetrics {
    const [viewport, setViewport] = useState(getViewport);

    useEffect(() => {
        const handleChange = () => setViewport(getViewport());
        handleChange();

        if (IS_SSR) return;
        else if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", handleChange);
        }

        window.addEventListener("resize", handleChange);
        if (window.visualViewport)
            window.visualViewport.addEventListener("resize", handleChange);
        else window.addEventListener("resize", handleChange);

        return () => {
            if (window.visualViewport)
                window.visualViewport.removeEventListener(
                    "resize",
                    handleChange
                );
            else window.removeEventListener("resize", handleChange);
        };
    }, []);

    return viewport;
}

function getViewport() {
    if (IS_SSR) {
        return {
            width: 0,
            height: 0,
            scale: 1,
        };
    } else if (window.visualViewport) {
        return {
            width: window.visualViewport.width,
            height: window.visualViewport.height,
            scale: window.visualViewport.scale,
        };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
    };
}
