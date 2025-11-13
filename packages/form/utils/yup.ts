import {
    ArraySchema,
    BooleanSchema,
    NumberSchema,
    setLocale,
    StringSchema,
    type Schema,
    type ValidationError,
} from "yup";
import { isArray, isObject } from "../../utils";

/**
 * Internal structure representing parsed Yup validation errors.
 *
 * Maps field paths to arrays of validation rule names.
 *
 * @internal
 */
interface ParsedErrors {
    [field: string]: string[];
}

const yupState = { isInitialized: false };

/**
 * Initializes Yup's locale with default error rule names.
 *
 * This ensures that validation errors use predictable rule identifiers instead
 * of full messages, allowing custom localization later.
 *
 * The function is idempotent: subsequent calls are no-ops after the first
 * successful initialization.
 *
 * @returns Void
 */
export function resetLocale() {
    if (yupState.isInitialized) return;

    setLocale({
        mixed: {
            required: "required",
            oneOf: "oneOf",
            notOneOf: "notOneOf",
            notType: "notType",
            defined: "defined",
        },
        string: {
            length: "length",
            min: "min",
            max: "max",
            matches: "matches",
            email: "email",
            url: "url",
            uuid: "uuid",
            trim: "trim",
            lowercase: "lowercase",
            uppercase: "uppercase",
        },
        number: {
            min: "min",
            max: "max",
            lessThan: "lessThan",
            moreThan: "moreThan",
            positive: "positive",
            negative: "negative",
            integer: "integer",
        },
        date: {
            min: "min",
            max: "max",
        },
        object: {
            noUnknown: "noUnknown",
        },
        array: {
            length: "length",
            min: "min",
            max: "max",
        },
        boolean: {
            isValue: "isValue",
        },
    });
    yupState.isInitialized = true;
}

/**
 * Determines the default value for a Yup schema based on its type.
 *
 * - StringSchema -> empty string
 * - NumberSchema -> 0
 * - BooleanSchema -> false
 * - ArraySchema -> empty array
 * - Other types -> null
 *
 * @template T - The expected type of the schema.
 * @param schema - The Yup schema to resolve a default for.
 * @returns The default value for the schema type.
 */
export function resolveYupDefault<T>(schema: Schema): T {
    if (schema instanceof StringSchema) return "" as T;
    if (schema instanceof NumberSchema) return 0 as T;
    if (schema instanceof BooleanSchema) return false as T;
    if (schema instanceof ArraySchema) return [] as T;
    return null as T;
}

/**
 * Parses Yup validation errors into a structured format.
 *
 * Extracts field paths and their associated error rule names from a Yup
 * ValidationError (which may contain multiple nested errors).
 *
 * @param error - The error object (typically a Yup ValidationError or unknown).
 * @returns A ParsedErrors object mapping field paths to arrays of rule names.
 */
export function parseYupErrors(error: unknown): ParsedErrors {
    let result: ParsedErrors = {};

    if (isObject<ValidationError>(error)) {
        if (isArray(error.inner) && error.inner.length) {
            for (const err of error.inner) {
                result = { ...result, ...extractYupErrors(err) };
            }
        } else {
            result = { ...result, ...extractYupErrors(error) };
        }
    }

    return result;
}

/**
 * Extracts error information from a single Yup ValidationError.
 *
 * @param e - The Yup ValidationError to extract from.
 * @returns A ParsedErrors object with the field path and error rules, or
 *   undefined if extraction fails.
 * @internal
 */
function extractYupErrors(e: ValidationError): ParsedErrors | undefined {
    if (
        isObject<ValidationError>(e) &&
        isArray(e.errors) &&
        typeof e.path === "string"
    ) {
        return { [e.path]: e.errors };
    }

    return undefined;
}
