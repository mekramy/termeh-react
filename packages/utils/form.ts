/**
 * Extracts a single File object from various input types.
 *
 * Supported input shapes:
 *
 * - An array containing `File` objects (returns the first `File`)
 * - A `FileList` object (returns the first `File`)
 * - A single `File` object (returns that `File`)
 * - A `FormData` object containing `File` values (returns the first `File`)
 *
 * The function is defensive and returns `undefined` when no `File` is found.
 *
 * @param v - The value to extract a file from. Can be an array, FileList, File,
 *   FormData, or any other type.
 * @returns The first `File` found in the input or `undefined` if none exists.
 */
export function getFormFile(v: unknown): File | undefined {
    if (v instanceof File) {
        return v;
    }

    if (Array.isArray(v)) {
        return v.find((item): item is File => item instanceof File);
    }

    if (isFileList(v)) {
        return v.item(0) ?? undefined;
    }

    if (typeof FormData !== "undefined" && v instanceof FormData) {
        for (const item of v.values()) {
            if (item instanceof File) {
                return item;
            }
        }
    }

    return undefined;
}

/**
 * Extracts `File` objects from various input shapes and returns them as an
 * array.
 *
 * Supported input shapes:
 *
 * - An array containing `File` objects (returns all files in the array)
 * - A `FileList` object (returns all files in the list)
 * - A single `File` object (returns an array with that single `File`)
 * - A `FormData` object containing `File` values (returns all `File` values)
 *
 * The result is always a plain array and never `null` or `undefined`.
 *
 * @param v - The value to extract files from. Can be an array, FileList, File,
 *   FormData, or any other type.
 * @returns An array of `File` objects extracted from the input. If no files are
 *   found an empty array is returned.
 */
export function getFormFiles(v: unknown): File[] {
    if (v instanceof File) {
        return [v];
    }

    if (Array.isArray(v)) {
        return v.filter((item): item is File => item instanceof File);
    }

    if (isFileList(v)) {
        const files: File[] = [];

        for (const file of v) {
            files.push(file);
        }

        return files;
    }

    if (typeof FormData !== "undefined" && v instanceof FormData) {
        const files: File[] = [];

        for (const item of v.values()) {
            if (item instanceof File) {
                files.push(item);
            }
        }

        return files;
    }

    return [];
}

function isFileList(value: unknown): value is FileList {
    return typeof FileList !== "undefined" && value instanceof FileList;
}
