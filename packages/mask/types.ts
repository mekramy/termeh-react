import type { MaskitoMask, MaskitoOptions } from "@maskito/core";

/**
 * A mapping of custom token characters to their RegExp patterns.
 *
 * Used to define reusable placeholders within mask pattern strings. For
 * example, `{ "#": /[0-9]/ }` defines that "#" represents a single digit when
 * used in a pattern string.
 */
export type TokenMap = Record<string, RegExp>;

/**
 * A mask definition which may be provided as a simple string pattern or as a
 * `MaskitoMask` (the array/structure accepted by Maskito).
 *
 * String patterns use token characters (e.g., "#" for digits) which are
 * resolved using a TokenMap. Array patterns directly specify RegExp patterns
 * and literals.
 *
 * @example
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
 * Configuration object for creating a masked input with optional advanced
 * settings.
 *
 * Allows specifying either a simple `mask` pattern (string or MaskitoMask) or
 * full Maskito `options` for more control. When both are provided, the `mask`
 * is resolved and merged into the options.
 *
 * @example
 *     const m: MaskOption = {
 *         mask: "###-###",
 *     };
 *     const advanced: MaskOption = {
 *         mask: "###-###",
 *         options: { overwrite: true },
 *     };
 */
export interface MaskOption {
    /**
     * Optional Maskito-specific options for advanced behavior like custom
     * overwrite mode or input transformation.
     */
    options?: MaskitoOptions;

    /**
     * Optional pattern definition (string or MaskitoMask). String patterns use
     * token characters which are resolved using a TokenMap.
     */
    mask?: Definition;
}
