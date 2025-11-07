import * as yup from "yup";
import { extractNumeric } from "../../utils";

/**
 * Validates an Iranian bank card number using the Luhn algorithm.
 *
 * Rules:
 *
 * - Must contain exactly 16 digits (non-digit characters are ignored).
 * - Uses the Luhn checksum to verify validity.
 * - Empty or undefined input is considered valid (useful for optional fields).
 *
 * @param cardNumber - The card number string to validate. May include non-digit
 *   formatting characters (they will be stripped).
 * @returns True if the value is empty or a valid 16-digit Iranian bank card
 *   number according to the Luhn algorithm; otherwise false.
 */
export function isValidIranianBankCard(cardNumber?: string): boolean {
    if (!cardNumber) return true;
    cardNumber = extractNumeric(cardNumber);

    // Must be exactly 16 digits
    if (!/^[0-9]{16}$/.test(cardNumber)) return false;

    let sum = 0;
    let alternate = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let n = parseInt(cardNumber[i], 10);
        if (alternate) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        alternate = !alternate;
    }

    return sum % 10 === 0;
}

/**
 * Registers the `.iranianBankCard()` method on Yup's `StringSchema` prototype.
 *
 * Example: yup.string().iranianBankCard('invalid card number')
 *
 * @param defMessage - Default error message key used when validation fails.
 * @returns Void
 */
export function addIranianBankCardMethod(defMessage = "bank_card"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "iranianBankCard",
        function (message: string = defMessage) {
            return this.test(
                "iranianBankCard",
                message,
                (v) => !v || isValidIranianBankCard(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validates that the value is a valid Iranian bank card number.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        iranianBankCard(message?: string): this;
    }
}
