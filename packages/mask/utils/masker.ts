import { maskitoTransform, type MaskitoOptions } from "@maskito/core";
import {
    maskitoNumberOptionsGenerator,
    type MaskitoNumberParams,
} from "@maskito/kit";
import type { Definition, MaskOption } from "../types";
import { globalTokens, resolveOptions } from "./options";

/**
 * Applies a mask to a string value based on the provided configuration.
 *
 * Uses Maskito's transformation engine to format input according to the mask
 * pattern while respecting any configured overwrite behavior.
 *
 * @param value - The input string to be masked.
 * @param constructor - The masking configuration (MaskOption).
 * @returns The masked string.
 */
export function mask(value: string, constructor: MaskOption): string {
    const options = resolveOptions(globalTokens, constructor);
    return maskitoTransform(value, options);
}

/**
 * Creates a MaskOption from a pattern string or MaskitoMask.
 *
 * This is a convenience factory for simple pattern-based masking when no
 * advanced Maskito options are needed.
 *
 * @param pattern - The masking pattern definition (string pattern like
 *   "###-##-####" or MaskitoMask array).
 * @returns A MaskOption configured with the provided pattern.
 */
export function patternMask(pattern: Definition): MaskOption {
    return { mask: pattern };
}

/**
 * Creates a numeric MaskOption using MaskitoNumberParams.
 *
 * Generates Maskito options preconfigured for numeric formatting with a
 * thousands separator (default: space).
 *
 * @param options - Configuration for numeric masking (e.g., `{ precision: 2,
 *   sign: "always" }`).
 * @returns A MaskOption configured for numeric input.
 */
export function numericMask(options: MaskitoNumberParams = {}): MaskOption {
    return {
        options: maskitoNumberOptionsGenerator({
            thousandSeparator: " ",
            ...options,
        }),
    };
}

/**
 * Creates a custom MaskOption from MaskitoOptions.
 *
 * For advanced use cases where direct Maskito configuration is needed.
 *
 * @param option - Custom Maskito options (see Maskito documentation for full
 *   configuration).
 * @returns A MaskOption wrapping the provided Maskito options.
 */
export function customMask(option: MaskitoOptions): MaskOption {
    return { options: option };
}
