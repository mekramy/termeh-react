/**
 * Flattens a field path by converting array bracket notation to dot notation.
 *
 * - Converts `"users[0].email"` to `"users.0.email"`.
 * - Normalizes multiple consecutive dots.
 * - Removes leading and trailing dots.
 *
 * @param path - The field path to flatten.
 * @returns The normalized, flattened path string.
 */
export function flatternPath(path: string): string {
    return path
        ? path
              .trim()
              .replace(/\[(\d+)\]/g, ".$1")
              .replace(/\.+/g, ".")
              .replace(/^\./, "")
              .replace(/\.$/, "")
        : "";
}

/**
 * Extracts the root (first) segment of a field path.
 *
 * - For `"users.0.email"`, returns `"users"`.
 * - For `"email"`, returns `"email"`.
 *
 * @param path - The field path.
 * @returns The root path segment.
 */
export function rootPath(path: string): string {
    return flatternPath(path).split(".")[0];
}

/**
 * Converts numeric segments in a path to wildcard "*" characters.
 *
 * Useful for creating a generic error pattern that matches any array element.
 *
 * - For `"users.0.email"`, returns `"users.*.email"`.
 * - For `"name"`, returns `"name"`.
 *
 * @param path - The field path.
 * @returns The path with numeric segments replaced by "*".
 */
export function asteriskPath(path: string): string {
    return flatternPath(path)
        .split(".")
        .map((part) => (/^\d+$/.test(part) ? "*" : part))
        .join(".");
}
