import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validates an Iranian ID number (birth certificate).
 *
 * Rules:
 *
 * - Accepts 1 to 10 digits. Non-digit characters are stripped before validation.
 * - Empty or undefined input is considered valid (useful for optional fields).
 *
 * @param id - The candidate ID string. May include formatting characters, which
 *   will be removed before validation.
 * @returns True when the value is empty/undefined or contains 1 to 10 digits;
 *   otherwise false.
 */
export function isValidIranianIdNumber(id?: string): boolean {
    if (!id) return true;
    return /^[0-9]{1,10}$/.test(extractNumeric(id));
}

/**
 * Registers the `.iranianIdNumber()` validation method on Yup's `StringSchema`.
 *
 * Example: import * as yup from 'yup'; addIranianIdNumberMethod(); const schema
 * = yup.string().iranianIdNumber('invalid id');
 *
 * @param defMessage - Default error message key used when validation fails.
 * @returns Void
 */
export function addIranianIdNumberMethod(defMessage = "id_number"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianIdNumber",
        function (message: string = defMessage) {
            return this.test(
                "iranianIdNumber",
                message,
                (v) => !v || isValidIranianIdNumber(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validate that the value is a valid Iranian ID number.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianIdNumber(message?: string): this;
    }
}
