/**
 * Parses a value into a number, handling strings with commas, spaces, and
 * non-numeric characters.
 *
 * - Extracts the first numeric token (optionally with a decimal point and sign)
 *   and converts it to a Number.
 *
 * @param v - The input value to parse (may be a number, string, or other).
 * @returns The parsed number, or `NaN` when a numeric value cannot be
 *   extracted.
 */
export function parseNumber(v: unknown): number {
    if (v == null) return NaN;

    const match = String(v)
        .replace(/[^0-9.-]+/g, "")
        .match(/-?\d+(\.\d+)?/);
    if (!match) return NaN;
    return Number(match[0]);
}

/**
 * Extracts all numeric digits from the input and returns them as a string.
 *
 * - Useful when you need to remove formatting and non-digit characters while
 *   preserving the raw digits (for example, extracting phone numbers or IDs).
 *
 * @param v - The input value to process.
 * @returns A string containing only the digits (0-9) found in the input, or an
 *   empty string if none were found.
 */
export function extractNumeric(v: unknown): string {
    if (v == null) return "";
    return String(v).match(/\d/g)?.join("") ?? "";
}

/**
 * Replaces all non-numeric characters in the input with the provided separator
 * and returns the resulting string.
 *
 * - Keeps digits, minus sign, and decimal point; any other character becomes the
 *   `separator`. If the input is nullish, an empty string is returned.
 *
 * @param v - The value to normalize (any type).
 * @param separator - The string to use in place of non-numeric characters.
 * @returns The normalized string where groups of non-numeric characters are
 *   replaced by `separator`.
 */
export function unifySeparator(v: unknown, separator: string): string {
    if (v == null) return "";
    return String(v).replace(/[^0-9.-]+/g, separator);
}

/**
 * Formats a numeric value with thousands separators.
 *
 * - Accepts numbers or values that can be parsed into numbers (via
 *   `parseNumber`). Returns an empty string for invalid numbers.
 * - The `separator` parameter lets callers customize the thousands separator
 *   (default is comma).
 *
 * @param v - The value to format (number, numeric string, or other).
 * @param separator - The thousands separator to use (default: ",").
 * @returns The formatted number string with thousands separators, or an empty
 *   string when the input cannot be parsed as a valid number.
 */
export function formatNumber(v: unknown, separator = ","): string {
    const num = parseNumber(v);
    if (isNaN(num)) return "";

    return num.toLocaleString("en-US").replace(/,/g, separator);
}
