import { isArray, isObject } from "../utils";

/**
 * Encodes a value into a string representation.
 *
 * @param v - Value to encode.
 * @returns Encoded string ("[null]", "[undefined]", or String value).
 */
export function encodeValue(v: unknown): string {
    if (v === null) return "[null]";
    if (v === undefined) return "[undefined]";
    return String(v);
}

/**
 * Flattens an object or array into an array of "key:value" strings.
 *
 * @param obj - Object to flatten.
 * @param prefix - Key prefix for nested values.
 * @returns Array of flattened key:value strings.
 */
export function flatten(obj: unknown, prefix: string = ""): string[] {
    if (!isObject(obj) && !isArray(obj)) {
        return [`${prefix || "value"}:${encodeValue(obj)}`];
    }

    let result: string[] = [];

    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;

        if (isObject(v)) {
            result = result.concat(flatten(v, key));
        } else if (isArray(v)) {
            for (const el of v) {
                result = result.concat(flatten(el, key));
            }
        } else {
            result.push(`${key}:${encodeValue(v)}`);
        }
    }

    return result.sort();
}
