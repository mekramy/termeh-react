import * as yup from "yup";
import { getFormFile, getFormFiles } from "../../utils";

/**
 * Checks whether a single File's size falls within the provided byte range.
 *
 * @param file - The File instance to check. If `undefined`, the function
 *   returns true (no file -> considered valid).
 * @param minBytes - Minimum allowed size in bytes (inclusive). Defaults to 0.
 * @param maxBytes - Maximum allowed size in bytes (inclusive). Defaults to
 *   Number.MAX_SAFE_INTEGER.
 * @returns True when the file is absent or its size is within [minBytes,
 *   maxBytes].
 */
export function isValidFileSize(
    file?: File,
    minBytes: number = 0,
    maxBytes: number = Number.MAX_SAFE_INTEGER
): boolean {
    if (!file) return true;
    return file.size >= minBytes && file.size <= maxBytes;
}

/**
 * Adds `.fileSize()` and `.filesSize()` methods to Yup's mixed schema
 * prototype.
 *
 * - `.fileSize(min, max)` validates the size of the first file/value.
 * - `.filesSize(min, max)` validates the size of all files in the value.
 *
 * These helpers expect the value passed to the schema to be any of the shapes
 * supported by `getFormFile` / `getFormFiles` (File, FileList, array of Files,
 * FormData, etc.). Missing or empty values are treated as valid.
 *
 * @param defaultMessage - Default error message key used when a custom message
 *   is not provided.
 * @returns Void
 */
export function addFileSizeMethod(defaultMessage = "file_size"): void {
    yup.addMethod<yup.MixedSchema>(
        yup.mixed,
        "fileSize",
        function (min: number, max: number, message = defaultMessage) {
            return this.test("fileSize", message, (v: unknown) => {
                const file = getFormFile(v);
                if (!file) return true;
                return isValidFileSize(file, min, max);
            });
        }
    );

    yup.addMethod<yup.MixedSchema>(
        yup.mixed,
        "filesSize",
        function (min: number, max: number, message = defaultMessage) {
            return this.test("filesSize", message, (v: unknown) => {
                const files = getFormFiles(v);
                if (!files.length) return true;
                return files.every((f) => isValidFileSize(f, min, max));
            });
        }
    );
}

declare module "yup" {
    interface MixedSchema {
        /**
         * Validate the size of the (first) file in the value.
         *
         * @param min - Minimum allowed size in bytes (inclusive).
         * @param max - Maximum allowed size in bytes (inclusive).
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        fileSize(min: number, max: number, message?: string): this;

        /**
         * Validate the size of all files present in the value.
         *
         * @param min - Minimum allowed size in bytes (inclusive).
         * @param max - Maximum allowed size in bytes (inclusive).
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        filesSize(min: number, max: number, message?: string): this;
    }
}
