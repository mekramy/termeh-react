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
    return (v as any) || alt;
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
export function toArray<T>(v: any): T[] {
    return Array.isArray(v) ? Array.from<T>(v) : [];
}

/**
 * Deeply clones supported values including plain objects, arrays, Dates, Maps,
 * and Sets. Primitive values are returned as-is.
 *
 * - This implementation is intentionally simple and intended for common
 *   configuration objects or data structures. It is not optimized for highly
 *   complex graphs or objects with custom prototypes / circular references.
 *
 * @template T
 * @param obj - The value to clone.
 * @returns A deep clone of the provided value.
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;

    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Map) return new Map(Array.from(obj.entries())) as any;
    if (obj instanceof Set) return new Set(Array.from(obj.values())) as any;
    if (Array.isArray(obj)) return obj.map(deepClone) as any;

    const cloned: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone((obj as any)[key]);
        }
    }
    return cloned;
}
