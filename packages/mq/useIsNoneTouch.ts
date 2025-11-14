import { useEffect, useState } from "react";

const query = "screen and (hover: hover)";

/**
 * Hook that returns true when the device supports hover (non-touch devices).
 *
 * @returns True when the media query matches, otherwise false.
 */
export function useIsNoneTouch(): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mql = window.matchMedia(query);
        const handler = () => setMatches(mql.matches);

        mql.addEventListener("change", handler);
        setMatches(mql.matches);

        return () => mql.removeEventListener("change", handler);
    }, []);

    return matches;
}
