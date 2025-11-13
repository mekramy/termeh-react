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
    let file: File | undefined | null;

    if (Array.isArray(v)) {
        file = v[0] as File | undefined;
    } else if (typeof (v as FileList)?.item === "function") {
        file = (v as FileList).item(0) as File | null;
    } else if (v instanceof File) {
        file = v as File;
    } else if (typeof FormData !== "undefined" && v instanceof FormData) {
        const iter = (v as FormData).values();
        const first = iter.next().value;
        file = first instanceof File ? first : undefined;
    } else {
        file = undefined;
    }

    return file ?? undefined;
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
    const files: File[] = [];

    if (Array.isArray(v)) {
        files.push(
            ...(v as unknown[]).filter((x): x is File => x instanceof File)
        );
    } else if (typeof (v as FileList)?.item === "function") {
        const fl = v as FileList;
        for (let i = 0; i < fl.length; i++) {
            const f = fl.item(i);
            if (f instanceof File) files.push(f);
        }
    } else if (v instanceof File) {
        files.push(v);
    } else if (typeof FormData !== "undefined" && v instanceof FormData) {
        for (const val of (v as FormData).values()) {
            if (val instanceof File) files.push(val);
        }
    }

    return files;
}
