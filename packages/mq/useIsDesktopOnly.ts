import { useEffect, useState } from "react";
import { IS_SSR } from "../utils";

const query = "screen and (min-width: 1024px) and (max-width: 1215px)";

/**
 * Hook that returns true when the screen width is between 1024px and 1215px
 * (Desktop only).
 *
 * @returns True when the media query matches, otherwise false.
 */
export function useIsDesktopOnly(): boolean {
    const [matches, setMatches] = useState(() =>
        IS_SSR ? false : window.matchMedia(query).matches
    );

    useEffect(() => {
        if (IS_SSR) return;

        const mql = window.matchMedia(query);
        const handler = () => setMatches(mql.matches);

        mql.addEventListener("change", handler);
        setMatches(mql.matches);

        return () => mql.removeEventListener("change", handler);
    }, []);

    return matches;
}
