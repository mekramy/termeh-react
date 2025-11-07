import type { MaskitoElementPredicate } from "@maskito/core";
import { useMaskito } from "@maskito/react";
import { useMemo } from "react";
import type { MaskOption } from "../types";
import { globalTokens, resolveOptions } from "../utils/options";

/**
 * Hook that applies Maskito masking to form/input elements.
 *
 * @param constructor - Mask configuration object or `null` to disable masking.
 * @param elementPredicate - Optional predicate that selects which elements
 *   should be masked.
 * @returns A ref callback (from `useMaskito`) to attach to the target input
 *   element so Maskito can manage masking behavior.
 */
export function useMasker(
    constructor: MaskOption | null,
    elementPredicate?: MaskitoElementPredicate
) {
    const options = useMemo(
        () => (constructor ? resolveOptions(globalTokens, constructor) : null),
        [constructor]
    );

    return useMaskito({ options, elementPredicate });
}
