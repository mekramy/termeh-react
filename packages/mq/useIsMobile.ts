import { useEffect, useState } from "react";

const query = "screen and (max-width: 768px)";

/**
 * Hook that returns true when the screen width is up to 768px (Mobile devices).
 *
 * @returns True when the media query matches, otherwise false.
 */
export function useIsMobile(): boolean {
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
