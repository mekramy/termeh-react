import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validates an Iranian National Code (کد ملی).
 *
 * Rules:
 *
 * - After removing non-digit characters, the code must be exactly 10 digits.
 * - Uses the standard checksum algorithm for Iranian national codes.
 * - Empty or undefined input is considered valid (so the function is safe for
 *   optional fields).
 *
 * @param nationalCode - The national code string to validate. May include
 *   formatting characters (they will be stripped).
 * @returns `true` when the value is empty/undefined or a valid national code;
 *   otherwise `false`.
 */
export function isValidIranianNationalCode(nationalCode?: string): boolean {
    if (!nationalCode) return true;

    nationalCode = extractNumeric(nationalCode);

    // Must be exactly 10 digits
    if (!/^[0-9]{10}$/.test(nationalCode)) return false;

    const digits = nationalCode.split("").map(Number);
    const check = digits[9];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }

    const remainder = sum % 11;

    return remainder < 2 ? check === remainder : check === 11 - remainder;
}

/**
 * Registers `.iranianNationalCode()` on Yup's `StringSchema` prototype.
 *
 * Usage example: import * as yup from 'yup'; addIranianNationalCodeMethod();
 * const schema = yup.string().iranianNationalCode('invalid national code');
 *
 * @param defMessage - Default error message key used when validation fails.
 * @returns Void
 */
export function addIranianNationalCodeMethod(
    defMessage = "national_code"
): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianNationalCode",
        function (message: string = defMessage) {
            return this.test(
                "iranianNationalCode",
                message,
                (v) => !v || isValidIranianNationalCode(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validate that the value is a valid Iranian National Code.
         *
         * - Treats empty/undefined values as valid (combine with `.required()` to
         *   enforce presence if needed).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianNationalCode(message?: string): this;
    }
}
