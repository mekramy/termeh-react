/**
 * Retrieves the `content` attribute of a `<meta>` tag with the given name.
 *
 * - Looks up `meta[name="{name}"]` in the current `document`.
 * - If the element is not found or does not have a `content` attribute, the
 *   provided `fallback` value is returned.
 *
 * This helper is safe to call in environments where `document` exists. If the
 * module is executed in a non-browser environment that does not provide
 * `document`, this function will throw a ReferenceError — callers should guard
 * accordingly (or call only in browser contexts).
 *
 * @param name - The `name` attribute of the `<meta>` tag to search for.
 * @param fallback - The value to return when the meta tag cannot be found or
 *   does not contain a `content` attribute. Defaults to an empty string.
 * @returns The `content` attribute string for the matched meta tag, or the
 *   `fallback` value when not present.
 */
export function getMetaContent(name: string, fallback: string = ""): string {
    return (
        document
            .querySelector(`meta[name="${name}"]`)
            ?.getAttribute("content") ?? fallback
    );
}

/**
 * Copies the provided string to the system clipboard using the asynchronous
 * Clipboard API.
 *
 * - Uses `navigator.clipboard.writeText` when available.
 * - Returns a promise that resolves when the copy completes successfully.
 * - If the Clipboard API is unavailable (older browsers or restricted contexts),
 *   the returned promise will reject with an Error.
 *
 * Note: calling this function may require the document to be served over HTTPS
 * and may be subject to browser permissions. For best UX, invoke it in a user
 * gesture (e.g., a click handler).
 *
 * @param data - The string content to copy to the clipboard.
 * @returns A promise that resolves when the text has been copied, or rejects
 *   with an error if copying fails or the Clipboard API is unavailable.
 * @throws {Error} If the Clipboard API (`navigator.clipboard.writeText`) is not
 *   supported in the current environment.
 */
export async function copyToClipboard(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!navigator?.clipboard?.writeText) {
            reject(new Error("Clipboard API not supported"));
            return;
        }

        navigator.clipboard
            .writeText(data)
            .then(() => resolve())
            .catch((e) => reject(e));
    });
}
