/**
 * Represents a basic, non-object data type used by the application.
 *
 * - Includes `string`, `number`, `boolean`, and `null`.
 */
export type PrimitiveType = string | number | boolean | null;

/**
 * Represents a compound value composed from primitives:
 *
 * - A single primitive value
 * - An array of primitive values
 * - A record (object) with primitive values
 */
export type CompoundType =
    | PrimitiveType
    | PrimitiveType[]
    | Record<string, PrimitiveType>;

/**
 * Checks whether a value is a string.
 *
 * @param v - The value to test.
 * @returns `true` when `v` is a string, otherwise `false`.
 */
export function isString(v: unknown): v is string {
    return typeof v === "string";
}

/**
 * Checks whether a value is a boolean.
 *
 * @param v - The value to test.
 * @returns `true` when `v` is a boolean, otherwise `false`.
 */
export function isBoolean(v: unknown): v is boolean {
    return typeof v === "boolean";
}

/**
 * Checks whether a value is a number (JS number primitive).
 *
 * @param v - The value to test.
 * @returns `true` when `v` is a number, otherwise `false`.
 */
export function isNumber(v: unknown): v is number {
    return typeof v === "number";
}

/**
 * Determines whether a value is numeric (either a number or a numeric string)
 * and represents a finite number.
 *
 * - Accepts numeric strings like `"123"`, `"-4.5"`, and numbers.
 * - Rejects non-numeric strings, `NaN`, and infinite values.
 *
 * @param v - The value to test.
 * @returns `true` when `v` can be converted to a finite number, otherwise
 *   `false`.
 */
export function isNumeric(v: unknown): v is number | string {
    if (!["number", "string"].includes(typeof v)) return false;
    return !isNaN(Number(v)) && isFinite(Number(v));
}

/**
 * Converts a numeric-like value to a number if possible.
 *
 * - Uses `isNumeric` to determine convertibility.
 * - Returns `undefined` for non-numeric inputs.
 *
 * @param v - The value to convert to a number.
 * @returns The converted number when `v` is numeric, otherwise `undefined`.
 */
export function toNumber(v: unknown): number | undefined {
    if (isNumeric(v)) {
        return Number(v);
    }

    return undefined;
}

/**
 * Checks whether a value is an array.
 *
 * @template T - The expected element type of the array (used only for typing).
 * @param v - The value to test.
 * @returns `true` when `v` is an array, otherwise `false`.
 */
export function isArray<T>(v: unknown): v is T[] {
    return Array.isArray(v);
}

/**
 * Checks whether a value is a plain object (not `null` and not an array).
 *
 * - Does not verify the object's prototype (i.e., will return `true` for any
 *   object-like value that is not an array).
 *
 * @template T - The expected object type (used only for typing).
 * @param v - The value to test.
 * @returns `true` when `v` is an object (and not `null` or an array), otherwise
 *   `false`.
 */
export function isObject<T extends object>(v: unknown): v is T {
    return (
        v !== null &&
        v !== undefined &&
        typeof v === "object" &&
        !Array.isArray(v)
    );
}

/**
 * Checks whether a value is one of the supported primitive types.
 *
 * - The function treats `null` as a primitive for the purposes of this helper.
 *
 * @param v - The value to test.
 * @returns `true` when `v` is `string`, `number`, `boolean`, or `null`.
 */
export function isPrimitive(v: unknown): v is PrimitiveType {
    return v === null || isString(v) || isNumber(v) || isBoolean(v);
}

/**
 * Checks whether a value is an array containing only primitive values.
 *
 * @param v - The value to test.
 * @returns `true` when `v` is an array and every element is a primitive,
 *   otherwise `false`.
 */
export function isPrimitiveArray(v: unknown): v is PrimitiveType[] {
    return Array.isArray(v) && v.every(isPrimitive);
}

/**
 * Checks whether a value is an object whose property values are all primitives.
 *
 * - The object itself must pass `isObject` (i.e., not an array or `null`).
 *
 * @param v - The value to test.
 * @returns `true` when `v` is a record with only primitive values, otherwise
 *   `false`.
 */
export function isPrimitiveRecord(
    v: unknown
): v is Record<string, PrimitiveType> {
    return isObject(v) && Object.values(v).every(isPrimitive);
}

/**
 * Checks whether a value is a supported compound type (primitive, array of
 * primitives, or record of primitives).
 *
 * @param v - The value to test.
 * @returns `true` when `v` is a `CompoundType`, otherwise `false`.
 */
export function isCompoundType(v: unknown): v is CompoundType {
    return isPrimitive(v) || isPrimitiveArray(v) || isPrimitiveRecord(v);
}
