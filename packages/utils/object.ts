import { isArray, isObject, isPrimitive } from "./type";

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
    if (isPrimitive(obj) || obj === undefined) return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Map) return new Map(Array.from(obj.entries())) as T;
    if (obj instanceof Set) return new Set(Array.from(obj.values())) as T;
    if (isArray(obj)) return obj.map(deepClone) as T;
    if (!isObject(obj)) return obj;

    const cloned: Record<string, unknown> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
        }
    }
    return cloned as T;
}

/**
 * Returns the previous object if all keys match the next object, otherwise
 * returns the next object.
 *
 * Useful for React state updates to avoid unnecessary re-renders.
 */
export function retainOrReplace<T>(prev: T, next: T): T {
    if (typeof next !== "object" || !next) return prev;

    return Object.keys(next).every(
        (k) => prev[k as keyof typeof prev] === next[k as keyof typeof next]
    )
        ? prev
        : next;
}

/**
 * Checks whether `value` matches all properties defined by `source`.
 *
 * The comparison is recursive, allowing nested objects to be compared deeply.
 * Extra properties in `value` are ignored.
 *
 * Primitive values are compared using `Object.is`.
 *
 * @param source - The expected structure and values.
 * @param value - The value to match against. It may contain additional
 *   properties.
 * @returns `true` if every property defined by `source` matches the
 *   corresponding property in `value`; otherwise, `false`.
 */
export function matches<T>(source: T, value: T): boolean {
    if (Object.is(source, value)) return true;

    if (
        typeof source !== "object" ||
        source === null ||
        typeof value !== "object" ||
        value === null
    )
        return false;

    return Object.keys(source).every((key) => {
        const sourceValue = (source as Record<string, unknown>)[key];
        const valueValue = (value as Record<string, unknown>)[key];

        return matches(sourceValue, valueValue);
    });
}
