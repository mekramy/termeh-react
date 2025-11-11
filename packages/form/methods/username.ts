import * as yup from "yup";

/**
 * Validates a username string.
 *
 * Rules:
 *
 * - Accepts ASCII letters (a-z, A-Z), digits (0-9), and underscore `_`.
 * - Empty or undefined values are considered valid (use `.required()` to enforce
 *   presence).
 *
 * @param username - The username string to validate.
 * @returns True if the value is empty/undefined or a valid username; otherwise
 *   false.
 */
export function isValidUsername(username?: string): boolean {
    if (!username) return true;
    return /^[a-zA-Z0-9_]+$/.test(username);
}

/**
 * Registers a `.username()` method on Yup's `StringSchema`.
 *
 * Example: import * as yup from "yup"; addUsernameMethod(); const schema =
 * yup.string().username("invalid username");
 *
 * @param defMessage - Default error message key used when validation fails.
 * @returns Void
 */
export function addUsernameMethod(defMessage = "username"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "username",
        function (message: string = defMessage) {
            return this.test(
                "username",
                message,
                (v) => !v || isValidUsername(v)
            );
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validates that the string contains only letters, digits, and
         * underscore.
         *
         * - Treats empty/undefined values as valid (combine with `.required()` to
         *   enforce presence).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        username(message?: string): this;
    }
}
