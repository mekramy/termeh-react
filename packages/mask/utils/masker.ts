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
 * @param value - The input string to be masked
 * @param constructor - The masking configuration
 * @returns The masked string
 */
export function mask(value: string, constructor: MaskOption): string {
    const options = resolveOptions(globalTokens, constructor);
    return maskitoTransform(value, options);
}

/**
 * Creates a MaskOption from a pattern string or MaskitoMask.
 *
 * - Use @param for parameters
 * - Use @return for return values
 *
 * @param pattern - The masking pattern definition
 * @returns A configured MaskOption object
 */
export function patternMask(pattern: Definition): MaskOption {
    return { mask: pattern };
}

/**
 * Creates a numeric MaskOption using MaskitoNumberParams.
 *
 * - Use @param for parameters
 * - Use @return for return values
 *
 * @param options - Configuration for numeric masking
 * @returns A configured MaskOption object for numbers
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
 * - Use @param for parameters
 * - Use @return for return values
 *
 * @param option - Custom masking options
 * @returns A configured MaskOption object with custom settings
 */
export function customMask(option: MaskitoOptions): MaskOption {
    return { options: option };
}
