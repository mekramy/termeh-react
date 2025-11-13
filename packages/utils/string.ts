/**
 * Concatenates multiple items into a single space-separated string while
 * filtering out nullish, empty, and invalid numeric values.
 *
 * - Trims each item and excludes empty strings.
 * - Excludes `null` and `undefined`.
 * - Excludes `NaN` numeric values.
 *
 * @param items - A variadic list of items to concatenate. Items may be of any
 *   type; they will be converted to strings.
 * @returns A single string containing non-empty items separated by a single
 *   space. Returns an empty string if no items remain after filtering.
 */
export function concat(...items: unknown[]): string {
    return items
        .map((item) => {
            if (item == null || (typeof item === "number" && isNaN(item)))
                return "";
            const str = String(item).trim();
            return str.length > 0 ? str : "";
        })
        .filter(Boolean)
        .join(" ");
}

/**
 * Truncates the given string to the specified maximum length and appends an
 * ellipsis ("...") when truncation occurs.
 *
 * - If `length` is less than or equal to 0, an empty string is returned.
 * - If the source string is shorter or equal to `length`, it is returned
 *   unchanged.
 *
 * @param v - The string to truncate.
 * @param length - Maximum allowed length for the returned string.
 * @returns The truncated string with "..." appended when truncation occurs.
 */
export function truncate(v: string, length: number): string {
    if (length <= 0) return "";
    return v.length <= length ? v : `${v.slice(0, length)}...`;
}

/**
 * Produces a URL-friendly ASCII slug from the provided items.
 *
 * - Joins the items with the provided `joiner`.
 * - Converts to lower-case, removes non-alphanumeric ASCII characters (excluding
 *   the `joiner`), collapses repeated joiners, and trims leading / trailing
 *   joiners.
 *
 * @param joiner - The character or string used as the joiner in the slug.
 * @param items - One or more strings to include in the slug.
 * @returns A cleaned, lower-cased ASCII slug.
 */
export function slugify(joiner: string, ...items: string[]): string {
    return items
        .filter((item) => item != null && item.trim().length > 0)
        .map((item) => item.trim().toLowerCase())
        .join(joiner)
        .replace(/\s+/g, joiner)
        .replace(new RegExp(`[^a-z0-9${joiner}]+`, "g"), "")
        .replace(new RegExp(`${joiner}+`, "g"), joiner)
        .replace(new RegExp(`^${joiner}+|${joiner}+$`, "g"), "");
}

/**
 * Produces a slug while preserving Unicode characters.
 *
 * - Joins the items with the provided `joiner`.
 * - Normalizes repeated whitespace and repeated joiners.
 * - Trims leading and trailing joiners.
 *
 * @param joiner - The character or string used as the joiner in the slug.
 * @param items - One or more strings to include in the slug. Unicode characters
 *   are preserved (no ASCII-only filtering).
 * @returns A cleaned Unicode-aware slug.
 */
export function slugifyUnicode(joiner: string, ...items: string[]): string {
    return items
        .filter((item) => item != null && item.trim().length > 0)
        .map((item) => item.trim())
        .join(joiner)
        .replace(/\s+/g, joiner) // normalize spaces
        .replace(new RegExp(`${joiner}+`, "g"), joiner) // normalize repeated joiner
        .replace(new RegExp(`^${joiner}+|${joiner}+$`, "g"), ""); // trim leading/trailing joiner
}

/**
 * Maps an input string to a replacement value using a replacements map.
 *
 * - If the input value exists as a key in `replacements`, the corresponding value
 *   is returned.
 * - If a wildcard key `"*"` exists in `replacements` and the input is not found,
 *   the wildcard replacement is returned.
 * - Otherwise the original input value is returned.
 *
 * @param v - The input string to map.
 * @param replacements - An object mapping input strings to replacement strings.
 * @returns The replacement string if found, the wildcard replacement if
 *   present, or the original input value when no mapping is defined.
 */
export function mapValue(
    v: string,
    replacements: Record<string, string>
): string {
    if (v in replacements) return replacements[v];
    if ("*" in replacements) return replacements["*"];
    return v;
}
