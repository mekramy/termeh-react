import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validates an Iranian phone number (fixed-line).
 *
 * Rules:
 *
 * - After removing non-digit characters, the phone number must match the pattern:
 *   starts with '0', followed by a non-zero digit [1-9], then 9 more digits
 *   (total 11 digits).
 * - Empty or undefined input is considered valid (useful for optional fields).
 *
 * @param phone - The phone number string to validate. May contain formatting
 *   characters which will be removed before validation.
 * @returns True when the value is empty/undefined or a valid Iranian phone
 *   number; otherwise false.
 */
export function isValidIranianPhone(phone?: string): boolean {
    if (!phone) return true;
    return /^0[1-9][0-9]{9}$/.test(extractNumeric(phone));
}

/**
 * Registers the `.iranianPhone()` method on Yup's `StringSchema` prototype.
 *
 * Usage example: import * as yup from 'yup'; addIranianPhoneMethod(); const
 * schema = yup.string().iranianPhone('invalid phone');
 *
 * @param defMessage - Default error message key used when validation fails.
 * @returns Void
 */
export function addIranianPhoneMethod(defMessage = "phone"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianPhone",
        function (message: string = defMessage) {
            return this.test(
                "iranianPhone",
                message,
                (v) => !v || isValidIranianPhone(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validate that the string is a valid Iranian phone number.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianPhone(message?: string): this;
    }
}
