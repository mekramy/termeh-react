import * as yup from "yup";

/**
 * Validates whether a string is a valid IP:Port combination.
 *
 * Behavior:
 *
 * - For IPv4 the format is "x.x.x.x:port" where x is 0-255.
 * - For IPv6 the address part may contain colons; the last colon is used to
 *   separate the port. Typical IPv6 shorthand (::) forms are supported by the
 *   regex used here.
 * - The port must be an integer between 1 and 65535 (inclusive).
 * - Empty or undefined input is considered valid (useful for optional fields).
 *
 * @param ipPort - The candidate string to validate (e.g. "127.0.0.1:8080" or
 *   "[2001:db8::1]:443" or "2001:db8::1:443" depending on usage).
 * @returns True if the value is empty or a valid IP:Port pair; otherwise false.
 */
export function isValidIPPort(ipPort?: string): boolean {
    if (!ipPort) return true;

    // Find the last colon to separate the port. This handles IPv6 addresses that
    // contain multiple colons. Note: callers may prefer the bracketed IPv6 form
    // "[addr]:port" for clarity; this function is permissive and uses the last
    // colon as the separator.
    const lastColonIndex = ipPort.lastIndexOf(":");
    if (lastColonIndex === -1) return false;

    const ip = ipPort.slice(0, lastColonIndex);
    const portStr = ipPort.slice(lastColonIndex + 1);

    // Validate IP (IPv4 or IPv6)
    // IPv4 regex (0-255 per octet)
    const ipv4 =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    // IPv6 regex (simplified, covers common valid forms including :: shorthand)
    const ipv6 =
        /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,6}:))$/;

    const isIPValid = ipv4.test(ip) || ipv6.test(ip);
    if (!isIPValid) return false;

    // Validate port
    const port = Number(portStr);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return false;

    return true;
}

/**
 * Adds an `.ipPort()` method to Yup's `StringSchema` prototype for validating
 * IP:Port strings.
 *
 * Example: yup.string().ipPort('invalid ip:port')
 *
 * @param defMessage - Default error message key to use when validation fails.
 * @returns Void
 */
export function addIPPortMethod(defMessage = "ip_port"): void {
    yup.addMethod<yup.StringSchema>(
        yup.string,
        "ipPort",
        function (message: string = defMessage) {
            return this.test("ipPort", message, (v) => !v || isValidIPPort(v));
        }
    );
}

declare module "yup" {
    interface StringSchema {
        /**
         * Validates that the string is a valid "IP:Port" combination.
         *
         * - Treats empty/undefined values as valid (suitable for optional
         *   fields).
         *
         * @param message - Optional custom error message key.
         * @returns The current schema for chaining.
         */
        ipPort(message?: string): this;
    }
}
