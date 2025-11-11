import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validates an Iranian postal code (10 digits).
 *
 * Rules:
 *
 * - Non-digit characters are stripped before validation.
 * - The resulting string must be exactly 10 digits.
 * - Empty or undefined input is considered valid (useful for optional fields).
 *
 * @param postalCode - The postal code string to validate. May contain non-digit
 *   formatting which will be removed.
 * @returns True when the value is empty/undefined or a valid 10-digit postal
 *   code; otherwise false.
 */
export function isValidIranianPostalCode(postalCode?: string): boolean {
    if (!postalCode) return true;
    return /^[0-9]{10}$/.test(extractNumeric(postalCode));
}

/**
 * Registers the `.iranianPostalCode()` method on Yup's `StringSchema`
 * prototype.
 *
 * Example: import * as yup from "yup"; addIranianPostalCodeMethod(); const
 * schema = yup.string().iranianPostalCode("invalid postal code");
 *
 * @param defMessage - Default error message key used when validation fails.
 * @returns Void
 */
export function addIranianPostalCodeMethod(defMessage = "postal_code"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianPostalCode",
        function (message: string = defMessage) {
            return this.test(
                "iranianPostalCode",
                message,
                (v) => !v || isValidIranianPostalCode(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validate that the string is a valid Iranian postal code (10 digits).
         *
         * - Treats empty/undefined values as valid (combine with `.required()` to
         *   enforce presence).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianPostalCode(message?: string): this;
    }
}
