import { useMemo } from "react";

/**
 * Converts a value in rem units to pixels.
 *
 * @param amount The number of rem units to convert to pixels. If not provided,
 *   defaults to 1.
 * @returns The equivalent pixel value of the specified rem units.
 */
export function useRem(amount?: number): number {
    const rem = useMemo(() => {
        const root = document.documentElement;
        return parseFloat(getComputedStyle(root).fontSize);
    }, []);

    return rem * (amount ?? 1);
}
