import * as yup from "yup";

/**
 * Checks if a string is alphanumeric with Persian letters, English letters,
 * numbers, and optional extra characters.
 *
 * @param value - The string to validate.
 * @param includes - Extra characters to allow.
 * @returns True if the value is empty or contains only allowed characters;
 *   false otherwise.
 */
export function isAlphaNumericWithPersian(
    value?: string,
    includes: string[] = []
): boolean {
    if (!value) return true;

    const persianChars = "\u0600-\u06FF\uFB8A\u067E\u0686\u0698\u06AF";
    const escaped = includes
        .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("");
    const pattern = new RegExp(`^[a-zA-Z0-9${persianChars}${escaped}]+$`);

    return pattern.test(value);
}

/**
 * Adds the `.alphaNumericWithPersian()` method to Yup string schema.
 *
 * @param defMessage - Default error message used when validation fails.
 * @returns Void
 */
export function addAlphaNumericWithPersianMethod(
    defMessage = "alphaNumericWithPersian"
): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "alphaNumericWithPersian",
        function (message: string = defMessage, includes: string[] = []) {
            return this.test(
                "alphaNumericWithPersian",
                message,
                (v) => !v || isAlphaNumericWithPersian(v, includes)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Ensures the string is alphanumeric with Persian letters, English
         * letters, numbers, and optional extra characters.
         *
         * @param message - Custom error message.
         * @param includes - Extra characters to allow.
         * @returns The current schema for chaining.
         */
        alphaNumericWithPersian(message?: string, includes?: string[]): this;
    }
}
