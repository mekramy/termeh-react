import { useEffect, useState } from "react";
import { IS_SSR } from "../utils";

const query = "not print";

/**
 * Hook that returns true when the media is not being printed (screen mode).
 *
 * @returns True when the media query matches, otherwise false.
 */
export function useIsNotPrint(): boolean {
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
