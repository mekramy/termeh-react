/**
 * Create a flatten key string from mixed array of keys
 *
 * @param key Key array
 * @returns Flatten stable key string
 */
export function createKey(keys: unknown[], separator = "|"): string {
    return keys
        .map((v) => stableStringify(v, new WeakMap<object, boolean>()))
        .join(separator);
}

function stableStringify(
    value: unknown,
    seen: WeakMap<object, boolean>
): string {
    // Nullish
    if (value === null) return "null";
    if (typeof value === "undefined") return "undefined";

    // Primitives
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);
    if (typeof value === "bigint" || typeof value === "symbol")
        return `${value.toString()}`;

    // Extra types
    if (typeof value === "function") return "[Function]";
    if (value instanceof Date) return value.toISOString();

    // Check circular references
    if (seen.has(value)) {
        return `[Circular]`;
    }
    seen.set(value, true);

    // Array
    if (Array.isArray(value))
        return `[${value.map((v) => stableStringify(v, seen)).join(",")}]`;

    // Object
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys
        .map((k) => `${k}:${stableStringify(obj[k], seen)}`)
        .join(",")}}`;
}
