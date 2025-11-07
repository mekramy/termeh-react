import * as yup from "yup";

/**
 * Validates whether a string is a valid IPv4 or IPv6 address.
 *
 * - Accepts either IPv4 or IPv6 addresses.
 * - Returns `true` for empty or undefined input (so optional fields don't fail).
 *
 * @param ip - IP address string to validate (may be undefined).
 * @returns `true` if the value is empty or a valid IPv4/IPv6 address, otherwise
 *   `false`.
 */
export function isValidIP(ip?: string): boolean {
    if (!ip) return true;

    // IPv4 regex (0-255 per octet)
    const ipv4 =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    // IPv6 regex (simplified, covers common valid forms including :: shorthand)
    const ipv6 =
        /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|(::([0-9a-fA-F]{1,4}:){0,5}([0-9a-fA-F]{1,4}|:))|(([0-9a-fA-F]{1,4}:){1,6}:))$/;

    return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Adds an `.ip()` method to Yup's `StringSchema` prototype for validating IP
 * addresses.
 *
 * Example: yup.string().ip('invalid ip address')
 *
 * @param defMessage - Default error message key to use when validation fails.
 * @returns Void
 */
export function addIPMethod(defMessage = "ip"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "ip",
        function (message: string = defMessage) {
            return this.test("ip", message, (v) => !v || isValidIP(v));
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validates that the string is a valid IPv4 or IPv6 address.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        ip(message?: string): this;
    }
}
