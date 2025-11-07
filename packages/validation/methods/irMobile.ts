import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validates an Iranian mobile number.
 *
 * Rules:
 *
 * - Must start with '09' and contain 11 digits total.
 * - Non-digit characters are stripped before validation.
 * - Empty or undefined input is considered valid (useful for optional fields).
 *
 * @param mobile - The mobile number string to validate. May contain formatting
 *   characters which will be removed before validation.
 * @returns True when the value is empty/undefined or a valid Iranian mobile
 *   number; otherwise false.
 */
export function isValidIranianMobile(mobile?: string): boolean {
    if (!mobile) return true;
    return /^09[0-9]{9}$/.test(extractNumeric(mobile));
}

/**
 * Registers the `.iranianMobile()` method on Yup's `StringSchema` prototype.
 *
 * Example: import * as yup from "yup"; addIranianMobileMethod(); const schema =
 * yup.string().iranianMobile("invalid mobile");
 *
 * @param defMessage - Default error message key to use when validation fails.
 * @returns Void
 */
export function addIranianMobileMethod(defMessage = "mobile"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianMobile",
        function (message: string = defMessage) {
            return this.test(
                "iranianMobile",
                message,
                (v) => !v || isValidIranianMobile(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validate that the string is a valid Iranian mobile number.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianMobile(message?: string): this;
    }
}
