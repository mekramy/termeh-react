import * as yup from "yup";
import { getFormFile, getFormFiles } from "../../utils";

/**
 * Checks whether a single File's MIME type is included in the allowed list.
 *
 * @param file - The File instance to check. If `undefined`, the function
 *   returns true.
 * @param allowedMimes - Array of allowed MIME type strings. Defaults to an
 *   empty array.
 * @returns True when the file is absent or its MIME type is included in
 *   allowedMimes.
 */
export function isValidFileType(
    file?: File,
    allowedMimes: string[] = []
): boolean {
    if (!file) return true;
    return allowedMimes.includes(file.type);
}

/**
 * Adds `.fileType()` and `.filesType()` methods to Yup's mixed schema
 * prototype.
 *
 * - `.fileType(mimes)` validates the MIME type of the (first) file in the value.
 * - `.filesType(mimes)` validates the MIME type of all files present in the
 *   value.
 *
 * These helpers accept values in any shape supported by `getFormFile` /
 * `getFormFiles` (File, FileList, array of Files, FormData, etc.). Missing or
 * empty values are treated as valid.
 *
 * @param defaultMessage - Default error message key used when a custom message
 *   is not provided.
 * @returns Void
 */
export function addFileTypeMethod(defaultMessage = "file_type"): void {
    yup.addMethod<yup.MixedSchema>(
        yup.mixed,
        "fileType",
        function (allowedMimes: string[], message = defaultMessage) {
            return this.test("fileType", message, (v: unknown) => {
                const file = getFormFile(v);
                if (!file) return true;
                return isValidFileType(file, allowedMimes);
            });
        }
    );

    yup.addMethod<yup.MixedSchema>(
        yup.mixed,
        "filesType",
        function (allowedMimes: string[], message = defaultMessage) {
            return this.test("filesType", message, (v: unknown) => {
                const files = getFormFiles(v);
                if (!files.length) return true;
                return files.every((file) =>
                    isValidFileType(file, allowedMimes)
                );
            });
        }
    );
}

declare module "yup" {
    interface MixedSchema {
        /**
         * Validate the MIME type of the first file in the value.
         *
         * @param mimes - Array of allowed MIME type strings.
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        fileType(mimes: string[], message?: string): this;

        /**
         * Validate the MIME type of all files present in the value.
         *
         * @param mimes - Array of allowed MIME type strings.
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        filesType(mimes: string[], message?: string): this;
    }
}
