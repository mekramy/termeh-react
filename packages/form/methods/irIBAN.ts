import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validate an Iranian IBAN string.
 *
 * Behavior:
 *
 * - Non-digit characters are stripped from the input before processing.
 * - If the resulting digits do not include the "IR" prefix, "IR" is prepended.
 * - The function expects the canonical form `IR` + 24 digits (26 characters).
 * - Validation follows the IBAN algorithm: move the first four characters to the
 *   end, convert letters to numbers (A=10..Z=35), then compute mod 97 and check
 *   that the result equals 1.
 * - Empty or undefined inputs are considered valid (so the helper is safe for
 *   optional fields).
 *
 * @param iban - The input IBAN string to validate. May include formatting such
 *   as spaces or dashes and may omit the `IR` country prefix.
 * @returns True if the input is empty/undefined or a valid Iranian IBAN,
 *   otherwise false.
 */
export function isValidIranianIBAN(iban?: string): boolean {
    if (!iban) return true;

    // Remove all non-digit characters from input
    iban = extractNumeric(iban);

    // Ensure it starts with "IR" prefix for validation algorithm
    if (!iban.startsWith("IR")) {
        // Prepend the ISO country code 'IR' so we have the standard form
        iban = `IR${iban}`;
    }

    // Expect: IR + 24 digits (total length 26)
    if (!/^IR[0-9]{24}$/.test(iban)) return false;

    // Move first four characters to the end as required by IBAN check
    const rearranged = iban.slice(4) + iban.slice(0, 4);

    // Convert letters to numbers and accumulate a numeric string
    let numericIBAN = "";
    for (const char of rearranged) {
        if (char >= "A" && char <= "Z") {
            // Convert letters: 'A' -> 10, 'B' -> 11, ..., 'Z' -> 35
            numericIBAN += (char.charCodeAt(0) - 55).toString();
        } else if (char >= "0" && char <= "9") {
            numericIBAN += char;
        } else {
            // Any unexpected character invalidates the IBAN
            return false;
        }
    }

    // Compute modulo 97 using BigInt (handles very large numeric strings)
    try {
        const ibanBigInt = BigInt(numericIBAN);
        return ibanBigInt % 97n === 1n;
    } catch {
        // Conversion to BigInt failed (e.g., numeric string too large or invalid)
        return false;
    }
}

/**
 * Register a Yup string schema method `iranianIBAN` that validates Iranian
 * IBANs using `isValidIranianIBAN`.
 *
 * Example: import * as yup from 'yup'; addIranianIBANMethod(); const schema =
 * yup.string().iranianIBAN('invalid iban');
 *
 * @param defMessage - Default error message key to use when validation fails.
 * @returns Void
 */
export function addIranianIBANMethod(defMessage = "iban"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianIBAN",
        function (message: string = defMessage) {
            return this.test(
                "iranianIBAN",
                message,
                (v) => !v || isValidIranianIBAN(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validate that the string is a valid Iranian IBAN.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianIBAN(message?: string): this;
    }
}
