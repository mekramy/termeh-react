import { isNumeric, isObject, isString } from "../../utils";

/**
 * Executes a mapping function on a value if it passes a check, otherwise
 * returns a fallback.
 *
 * @template T - The return type of the map function.
 * @param v - The value to check and map.
 * @param check - Function to validate the value.
 * @param map - Function to transform the value if check passes.
 * @param fallback - Optional fallback value if check fails.
 * @returns The mapped value if check passes, otherwise the fallback.
 */
export function safe<T>(
    v: unknown,
    check: (v: unknown) => boolean,
    map: (v: unknown) => T,
    fallback?: T
): T | undefined {
    return check(v) ? map(v) : fallback;
}

/**
 * Safely returns a non-empty string or a fallback value.
 *
 * @param v - The value to check.
 * @param fallback - Optional fallback string if the value is invalid.
 * @returns The string if valid and non-empty, otherwise the fallback.
 */
export function stringSafe(v: unknown, fallback?: string): string | undefined {
    return safe(
        v,
        (x) => isString(x) && x !== "",
        (x) => x as string,
        fallback
    );
}

/**
 * Safely returns a trimmed non-empty string or a fallback value.
 *
 * @param v - The value to check and trim.
 * @param fallback - Optional fallback string if the value is invalid.
 * @returns The trimmed string if valid and non-empty, otherwise the fallback.
 */
export function stringTrimSafe(
    v: unknown,
    fallback?: string
): string | undefined {
    return safe(
        v,
        (x) => isString(x) && x.trim() !== "",
        (x) => (x as string).trim(),
        fallback
    );
}

/**
 * Safely returns a positive number or a fallback value.
 *
 * @param v - The value to check and convert to number.
 * @param fallback - Optional fallback number if the value is invalid or
 *   non-positive.
 * @returns The positive number if valid, otherwise the fallback.
 */
export function positiveSafe(
    v: unknown,
    fallback?: number
): number | undefined {
    return safe(
        v,
        (x) => isNumeric(x) && Number(x) > 0,
        (x) => Number(x),
        fallback
    );
}

/**
 * Safely returns a non-empty array or a fallback value.
 *
 * @template T - Type of array elements.
 * @param v - The value to check and cast as array.
 * @param fallback - Optional fallback array if the value is invalid or empty.
 * @returns The array if valid and non-empty, otherwise the fallback.
 */
export function arraySafe<T>(v: unknown, fallback?: T[]): T[] | undefined {
    return safe(
        v,
        (x) => Array.isArray(x) && x.length > 0,
        (x) => x as T[],
        fallback
    );
}

/**
 * Safely returns an object or a fallback value.
 *
 * @template T - Type of object.
 * @param v - The value to check and cast as object.
 * @param fallback - Optional fallback object if the value is invalid.
 * @returns The object if valid, otherwise the fallback.
 */
export function objectSafe<T>(v: unknown, fallback?: T): T | undefined {
    return safe(v, isObject, (x) => x as T, fallback);
}
