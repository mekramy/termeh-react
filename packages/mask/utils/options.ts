import type { MaskitoMask, MaskitoOptions } from "@maskito/core";
import type { Definition, MaskOption, TokenMap } from "../types";

/**
 * Default set of token mappings used by the masker utilities.
 *
 * Each token maps to a RegExp which is used by the mask resolver to transform
 * string patterns (like "(###) ###-####") into a MaskitoMask.
 *
 * Consumers can extend/override these tokens via `configureMaskerPlugin`.
 */
export let globalTokens: TokenMap = {
    "#": /[0-9]/,
    a: /[a-z]/i,
    N: /[a-z0-9]/i,
    X: /./,
};

/**
 * Merge user-provided tokens into the global token map.
 *
 * Note: this mutates `globalTokens` intentionally so that the rest of the
 * masker utilities pick up custom tokens without having to pass the map around
 * everywhere. Call this during app initialization if you want custom tokens
 * globally available.
 *
 * @example
 *     configureMasker({ tokens: { "#": /[0-9]/, $: /[0-9.]/ } });
 *
 * @param options - Partial configuration object. Only `tokens` is currently
 *   supported.
 * @returns Void
 */
export function configureMasker(options: { tokens?: TokenMap } = {}): void {
    if (!options.tokens) return;
    globalTokens = { ...globalTokens, ...options.tokens };
}

/**
 * Resolve a mask definition into a MaskitoMask (the structure Maskito expects).
 *
 * Behavior:
 *
 * - If `mask` is a function or a RegExp, it is returned as-is.
 * - If `mask` is an array, each item is normalized (RegExp items pass through).
 * - If `mask` is a string, it's split into characters and each character is
 *   looked up in the `tokens` map. The escape token `!` allows literal tokens.
 *
 * @param tokens - Token map used to translate string tokens into RegExp
 *   patterns.
 * @param mask - The mask definition (string, MaskitoMask, or function).
 * @returns MaskitoMask The resolved Maskito mask ready for Maskito APIs.
 */
export function resolveMask(tokens: TokenMap, mask: Definition): MaskitoMask {
    if (typeof mask === "function" || mask instanceof RegExp) return mask;

    let mustEscape = false;
    const input = Array.isArray(mask) ? mask : `${mask}`.split("");
    return input
        .map((item) => {
            if (item instanceof RegExp) return item;

            if (mustEscape) {
                mustEscape = false;
                return item;
            }

            if (item === "!") {
                mustEscape = true;
                return "";
            }

            return tokens[item] || item;
        })
        .filter(Boolean) as MaskitoMask;
}

/**
 * Resolve a MaskOption into MaskitoOptions used by Maskito transform hooks.
 *
 * If the provided option contains a `mask` property it will be resolved using
 * `resolveMask`. Otherwise `option.options` is returned (or an empty object
 * when none provided).
 *
 * @param tokens - Token map used for resolving masks (usually `globalTokens`).
 * @param option - MaskOption that may contain `mask` and/or `options` fields.
 * @returns MaskitoOptions Maskito-ready options object.
 */
export function resolveOptions(
    tokens: TokenMap,
    option: MaskOption
): MaskitoOptions {
    return option?.mask
        ? { ...(option?.options || {}), mask: resolveMask(tokens, option.mask) }
        : (option.options ?? ({} as MaskitoOptions));
}
