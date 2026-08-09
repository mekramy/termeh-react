import { useEffect, useState } from "react";
import { IS_SSR } from "../utils";

const query = "screen and (min-width: 1216px) and (max-width: 1407px)";

/**
 * Hook that returns true when the screen width is between 1216px and 1407px
 * (Widescreen only).
 *
 * @returns True when the media query matches, otherwise false.
 */
export function useIsWidescreenOnly(): boolean {
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
