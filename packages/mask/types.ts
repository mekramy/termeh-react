import type { MaskitoMask, MaskitoOptions } from "@maskito/core";

/**
 * Maps custom string tokens to RegExp patterns. Used for defining custom
 * masking patterns. Example: `{ "#": /[0-9]/ }`.
 */
export type TokenMap = Record<string, RegExp>;

/**
 * A mask definition which may be provided as a simple string pattern or as a
 * `MaskitoMask` (the array/structure accepted by Maskito).
 *
 * Example usage:
 *
 *     const stringPattern: Definition = "###-##-####";
 *     const maskitoPattern: Definition = [
 *         /\d/,
 *         /\d/,
 *         /\d/,
 *         "-",
 *         /\d/,
 *         /\d/,
 *         "-",
 *         /\d/,
 *         /\d/,
 *         /\d/,
 *         /\d/,
 *     ];
 */
export type Definition = string | MaskitoMask;

/**
 * Configuration for mask usage. Either supply an explicit `mask` pattern or a
 * full `options` object compatible with Maskito. When both are provided the
 * `mask` will be resolved and merged into the resulting Maskito options.
 *
 * @example
 *     const m: MaskOption = {
 *         mask: "###-###",
 *         options: {}, // maskito options placeholder
 *     };
 */
export interface MaskOption {
    /** Optional Maskito-specific options for advanced/custom behavior. */
    options?: MaskitoOptions;
    /** Optional pattern definition (string or MaskitoMask) for simple masks. */
    mask?: Definition;
}
