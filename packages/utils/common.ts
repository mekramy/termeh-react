import { customAlphabet } from "nanoid";

const idGenerator = customAlphabet(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

/**
 * Generates a new random ID string with a specified length.
 *
 * - Uses a fast, URL-friendly alphabet from `nanoid`.
 *
 * @param length - The length of the ID to generate (default: 10)
 * @returns A random string containing alphanumeric characters
 */
export function newId(length = 10): string {
    return idGenerator(length);
}

/**
 * Returns the provided value if it is not `null` or `undefined`; otherwise
 * returns the supplied alternative.
 *
 * - Useful for providing fallback values while preserving falsy-but-valid values
 *   like `0` or `""`.
 *
 * @template T
 * @param v - The value to check.
 * @param alt - The alternative value to return if `v` is `null` or `undefined`.
 * @returns The original value `v` when present; otherwise `alt`.
 */
export function nullish<T>(v: T | null | undefined, alt: T): T {
    return v ?? alt;
}

/**
 * Returns the provided value if it is truthy; otherwise returns the supplied
 * alternative.
 *
 * - This treats falsy values (e.g., `0`, `""`, `false`, `null`, `undefined`) as
 *   absent and will return `alt` in those cases.
 *
 * @template T
 * @param v - The value to check.
 * @param alt - The alternative value to return if `v` is falsy.
 * @returns The original value `v` when truthy; otherwise `alt`.
 */
export function alter<T>(v: T, alt: T): T {
    return (v as T) || alt;
}

/**
 * Ensures the input is returned as an array. If the input is an array it is
 * shallow-copied and returned; otherwise an empty array is returned.
 *
 * - This is a defensive helper to normalize values that may or may not be arrays.
 *
 * @template T
 * @param v - The value to convert into an array.
 * @returns The array when `v` is an array, otherwise an empty array.
 */
export function toArray<T>(v: unknown): T[] {
    return Array.isArray(v) ? Array.from<T>(v) : [];
}
