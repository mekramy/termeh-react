import { useEffect, useState } from "react";
import { IS_SSR } from "../utils";

const query = "screen and (min-width: 1216px)";

/**
 * Hook that returns true when the screen width is at least 1216px (Widescreen
 * and above).
 *
 * @returns True when the media query matches, otherwise false.
 */
export function useIsWidescreen(): boolean {
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
