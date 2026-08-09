import { useEffect, useState } from "react";
import { IS_SSR } from "../utils";

const query = "screen and (prefers-contrast: less)";

/**
 * Hook that returns true when the user prefers less contrast in the UI.
 *
 * @returns True when the media query matches, otherwise false.
 */
export function usePrefersLessContrast(): boolean {
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
