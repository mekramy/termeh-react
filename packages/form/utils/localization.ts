import { isObject, isString } from "../../utils";
import type { LocalizedMessages } from "../types";

/**
 * Finds a localized error message from a LocalizedMessages object.
 *
 * Searches for messages using a fallback resolution hierarchy:
 *
 * 1. Locale-specific field-specific error message
 * 2. Locale-specific field wildcard message
 * 3. Global field-specific error message
 * 4. Global field wildcard message
 * 5. Locale wildcard message
 * 6. Global wildcard message
 *
 * @param messages - The LocalizedMessages object to search.
 * @param field - The field name or path (e.g., "email", "user.name").
 * @param error - The validation rule or error type.
 * @param locale - The current locale code (e.g., "en", "fa"). If provided,
 *   locale-specific messages are checked first.
 * @returns The found message string, or undefined if no matching message
 *   exists.
 */
export function findMessage(
    messages: LocalizedMessages,
    field: string,
    error: string,
    locale?: string
): string | undefined {
    if (!isObject(messages)) return undefined;

    // locale.field.error
    // locale.field."*"
    if (
        locale &&
        isObject(messages[locale]) &&
        isObject(messages[locale][field])
    ) {
        const result = firstValidMessage(
            messages[locale][field][error],
            messages[locale][field]["*"]
        );

        if (isValidMesssage(result)) {
            return result;
        }
    }

    // field.error
    // field."*"
    if (isObject(messages[field])) {
        const result = firstValidMessage(
            messages[field][error],
            messages[field]["*"]
        );

        if (isValidMesssage(result)) {
            return result;
        }
    }

    //  locale."*"
    if (
        locale &&
        isObject(messages[locale]) &&
        isValidMesssage(messages[locale]["*"])
    ) {
        return messages[locale]["*"];
    }

    // "*"
    if (isValidMesssage(messages["*"])) {
        return messages["*"];
    }

    // Fallback
    return undefined;
}

/**
 * Type guard that checks if a value is a valid, non-empty string message.
 *
 * @param m - The value to check.
 * @returns True if m is a string with non-whitespace content, otherwise false.
 */
function isValidMesssage(m: unknown): m is string {
    return !!m && isString(m) && !!m.trim();
}

/**
 * Finds and returns the first valid message from a list of candidates.
 *
 * @param messages - One or more message values to check.
 * @returns The first valid message string, or undefined if none found.
 */
function firstValidMessage(...messages: unknown[]): string | undefined {
    for (const message of messages) {
        if (isValidMesssage(message)) {
            return message;
        }
    }

    return undefined;
}
