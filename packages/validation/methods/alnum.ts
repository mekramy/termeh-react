import * as yup from "yup";

/**
 * Checks if a string is alphanumeric (letters and numbers) with optional extra
 * allowed characters.
 *
 * @param value - The string to validate.
 * @param includes - Extra characters to allow.
 * @returns True if valid, otherwise false.
 */
export function isAlphaNumeric(
    value?: string,
    includes: string[] = []
): boolean {
    if (!value) return true;

    const escaped = includes
        .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("");
    const pattern = new RegExp(`^[a-zA-Z0-9${escaped}]+$`);

    return pattern.test(value);
}

/**
 * Adds the `.alphaNumeric()` method to Yup string schema.
 *
 * @param defMessage - Default error message.
 * @returns Void
 */
export function addAlphaNumericMethod(defMessage = "alphaNumeric"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "alphaNumeric",
        function (message: string = defMessage, includes: string[] = []) {
            return this.test(
                "alphaNumeric",
                message,
                (v) => !v || isAlphaNumeric(v, includes)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Ensures the string is alphanumeric with optional extra allowed
         * characters.
         *
         * @param message - Custom error message.
         * @param includes - Extra characters to allow.
         * @returns The current schema for chaining.
         */
        alphaNumeric(message?: string, includes?: string[]): this;
    }
}
