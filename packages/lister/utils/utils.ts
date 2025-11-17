import { isNumeric, isObject, isString, type PrimitiveType } from "../../utils";
import type { OrderType, SortType } from "../types";

/** Checks whether a value is a valid {@link OrderType}. */
export function isOrderType(v: unknown): v is OrderType {
    return v === "asc" || v === "desc";
}

/**
 * Validates that a value conforms to the {@link SortType} structure. A valid
 * object must contain:
 *
 * - `field`: string
 * - `order`: valid {@link OrderType}
 */
export function isSortType(v: unknown): v is SortType {
    return (
        isObject(v) &&
        "field" in v &&
        isString(v.field) &&
        "order" in v &&
        isOrderType(v.order)
    );
}

/**
 * Encodes a primitive value for URL-safe transport.
 *
 * - `null` and `undefined` become the literal token `[null]`
 * - All other values are stringified and URI-encoded
 */
export function encodeValue(v: PrimitiveType): string {
    return v == null
        ? encodeURIComponent("[null]")
        : encodeURIComponent(String(v));
}

/** Decodes a previously encoded primitive string value. */
export function decodeValue(v: string): string {
    return decodeURIComponent(v);
}

/**
 * Infers the correct primitive type from its encoded string form.
 *
 * Supported conversions:
 *
 * - `"true"` → `true`
 * - `"false"` → `false`
 * - `"[null]"` → `null`
 * - Numeric strings → number
 * - Otherwise returned as string
 */
export function inferType(value: string): PrimitiveType {
    value = decodeValue(value);
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "[null]") return null;
    if (isNumeric(value)) return Number(value);
    return value;
}

/** Encodes an array of primitive values into a comma-separated string. */
export function encodeArray(value: PrimitiveType[]): string {
    return value.map(encodeValue).join(",");
}

/** Decodes a comma-separated list of encoded primitive values. */
export function decodeArray(encoded: string): PrimitiveType[] {
    return encoded.split(",").map(inferType);
}

/**
 * Encodes a key-value object of primitives into a compact string:
 *
 * Format: `key:value,key:value`
 */
export function encodeObject(value: Record<string, PrimitiveType>): string {
    return Object.entries(value)
        .map(([k, v]) => `${encodeValue(k)}:${encodeValue(v)}`)
        .join(",");
}

/** Decodes an object previously encoded with {@link encodeObject}. */
export function decodeObject(encoded: string): Record<string, PrimitiveType> {
    const obj: Record<string, PrimitiveType> = {};
    for (const part of encoded.split(",")) {
        const [k, v] = part.split(":");
        if (k.trim() && v) {
            obj[decodeValue(k.trim())] = inferType(v);
        }
    }
    return obj;
}

/**
 * Encodes an array of {@link SortType} into a compact comma-separated string.
 *
 * Format: `field:order,field:order`
 */
export function encodeSorts(sorts: SortType[]): string {
    return sorts
        .map((s) => `${encodeValue(s.field)}:${encodeValue(s.order)}`)
        .join(",");
}

/**
 * Decodes a list of sorts previously encoded with {@link encodeSorts}. Invalid
 * entries are skipped.
 */
export function decodeSorts(encoded: string): SortType[] {
    return encoded
        .split(",")
        .map((item) => {
            if (!item.includes(":")) return undefined;
            const [fieldRaw, orderRaw] = item.split(":");
            const field = decodeValue(fieldRaw.trim());
            const order = decodeValue(orderRaw);
            return field && isOrderType(order) ? { field, order } : undefined;
        })
        .filter((i): i is SortType => i !== undefined);
}

/**
 * Removes "empty" or "zero-like" values from an object.
 *
 * Empty or zero-like values are defined as:
 *
 * - `null` or `undefined`
 * - Empty arrays (`[]`)
 * - Empty objects (`{}`)
 *
 * @example
 *     removeZero({ a: 1, b: null, c: [], d: {} });
 *     // Returns: { a: 1 }
 *
 * @template T - Type of the input object.
 * @param v - The object to clean. If not a valid object, returns an empty
 *   object.
 * @returns A new object with all empty values removed.
 */
export function removeZero<T extends Record<string, unknown>>(
    v?: T
): Record<string, unknown> {
    if (!isObject(v)) return {};
    return Object.fromEntries(
        Object.entries(v).filter(([, val]) => {
            if (val == null) return false;
            if (Array.isArray(val)) return val.length > 0;
            if (isObject(val)) return Object.keys(val).length > 0;
            return true;
        })
    );
}
