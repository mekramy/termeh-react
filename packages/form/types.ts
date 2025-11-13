import type { Schema } from "yup";

/**
 * A no-argument callback function type.
 *
 * @callback FUNC
 * @returns {void}
 */
export type FUNC = () => void;

/**
 * A hierarchical map of localized error messages with fallback resolution.
 *
 * Supports both per-locale and global message definitions, with the following
 * resolution priority:
 *
 * 1. `messages[locale][field][rule]`
 * 2. `messages[locale][field]["*"]`
 * 3. `messages[field][rule]`
 * 4. `messages[field]["*"]`
 * 5. `messages[locale]["*"]`
 * 6. `messages["*"]`
 *
 * Each locale can define field-specific messages or use "_" as a fallback for
 * all fields. Similarly, field objects can define rule-specific messages or use
 * "_" as a wildcard for all rules.
 */
export interface LocalizedMessages {
    [locale: string | "*"]:
        | string
        | {
              [field: string | "*"]:
                  | string
                  | {
                        [rule: string | "*"]: string;
                    };
          };
}

/**
 * A collection of validation errors for a specific field.
 *
 * Each key is a validation rule name, and the value contains the error message
 * and a flag indicating whether the message was explicitly set.
 */
export interface FieldErrors {
    [rule: string]: { fixed: boolean; message: string };
}

/**
 * Query mode for retrieving field errors.
 *
 * - `"absolute"`: Returns errors for the exact field path (e.g.,
 *   "users.0.email").
 * - `"relative"`: Returns errors for the root field (e.g., "users").
 */
export type ErrorQuery = "absolute" | "relative";

/**
 * Store for managing form field validation errors.
 *
 * Provides error tracking, localization, and subscription support for reactive
 * updates when errors change.
 */
export interface ErrorStore {
    /**
     * Returns the current map of all field errors.
     *
     * @returns A Map where keys are field paths and values are FieldErrors
     *   objects.
     */
    getErrors: () => Map<string, FieldErrors>;

    /**
     * Retrieves errors for a specific field path.
     *
     * @param path - The field path to query (e.g., "email" or "users.0.email").
     * @param query - How to interpret the path ("absolute" for exact match,
     *   "relative" for root field). Defaults to "relative".
     * @returns The FieldErrors object for the path, or undefined if no errors
     *   exist.
     */
    getSnapshot: (path: string, query: ErrorQuery) => FieldErrors | undefined;

    /**
     * Subscribes to changes for a specific field's errors.
     *
     * @param path - The field path to watch.
     * @param fn - Callback function invoked when errors change for this field.
     * @returns A function that unsubscribes the listener when called.
     */
    subscribe: (path: string, fn: FUNC) => () => boolean | undefined;

    /**
     * Sets the localized error messages and current locale.
     *
     * Re-translates all existing errors with the new locale and messages.
     *
     * @param messages - The LocalizedMessages object containing error message
     *   definitions.
     * @param locale - The active locale code (e.g., "en", "fa"), or undefined
     *   to remove locale context.
     * @returns Void
     */
    setLocalization: (
        messages: LocalizedMessages,
        locale: string | undefined
    ) => void;

    /**
     * Clears all errors from the store.
     *
     * @returns Void
     */
    reset: () => void;

    /**
     * Clears errors for a specific field.
     *
     * @param path - The field path to clear errors for.
     * @returns Void
     */
    clear: (path: string) => void;

    /**
     * Parses and stores validation errors from a Yup ValidationError object.
     *
     * @param e - The error to parse (typically a Yup ValidationError).
     * @returns Void
     */
    parseForm: (e: unknown) => void;

    /**
     * Parses and stores errors from a server response object.
     *
     * Expects an object where keys are field paths and values are error
     * information (strings, arrays of strings, or objects with rule-message
     * mappings).
     *
     * @param e - The response error object to parse.
     * @returns Void
     */
    parseResponse: (e: unknown) => void;

    /**
     * Parses and stores validation errors for a specific field.
     *
     * @param path - The field path to associate with these errors.
     * @param e - The error to parse (typically a Yup ValidationError).
     * @returns Void
     */
    parseField: (path: string, e: unknown) => void;

    /**
     * Manually sets an error for a field and validation rule.
     *
     * @param path - The field path.
     * @param rule - The validation rule name.
     * @param message - Optional explicit error message; if omitted, the message
     *   is resolved from localized messages.
     * @returns Void
     */
    invalidate: (path: string, rule: string, message?: string) => void;
}

/**
 * Store for managing form field state and context.
 *
 * Tracks field values, validation state, schemas, and supports subscription for
 * reactive updates.
 */
export interface FieldStore {
    /**
     * Returns the current map of all registered fields.
     *
     * @returns A Map where keys are field names and values are FieldContext
     *   objects.
     */
    getFields: () => Map<string, FieldContext>;

    /**
     * Retrieves the context for a specific field.
     *
     * @param name - The field name.
     * @returns The FieldContext for the field, or undefined if not registered.
     */
    getSnapshot: (name: string) => FieldContext | undefined;

    /**
     * Subscribes to changes for a specific field.
     *
     * @param name - The field name to watch.
     * @param fn - Callback function invoked when the field's context changes.
     * @returns A function that unsubscribes the listener when called.
     */
    subscribe: (name: string, fn: FUNC) => () => boolean | undefined;

    /**
     * Resets multiple fields to their initial values (or provided values).
     *
     * @param values - An object mapping field names to their reset values.
     *   Fields not in this map will use their stored initial value.
     * @returns Void
     */
    reset: (values: Record<string, unknown>) => void;

    /**
     * Resets a single field to its initial value or a provided value.
     *
     * @param name - The field name to reset.
     * @param value - Optional value to reset to. If not provided, the field's
     *   initial value is used.
     * @returns Void
     */
    resetField: (name: string, value: unknown) => void;

    /**
     * Registers a new field or updates an existing field's context.
     *
     * @template T - The field value type.
     * @param name - The field name.
     * @param context - The FieldContext containing the field's configuration
     *   and state.
     * @returns Void
     */
    setField: <T = unknown>(name: string, context: FieldContext<T>) => void;

    /**
     * Updates a field's value and marks it as touched if the new value differs
     * from the current value.
     *
     * @param name - The field name.
     * @param value - The new value to set.
     * @returns Void
     */
    setValue: (name: string, value: unknown) => void;

    /**
     * Retrieves the context for a specific field.
     *
     * @param name - The field name.
     * @returns The FieldContext for the field, or undefined if not registered.
     */
    getField: (name: string) => FieldContext | undefined;
}

/**
 * The context data for a single form field.
 *
 * Contains field metadata, validation schema, and lifecycle hooks for custom
 * transformations (parsing and serialization).
 *
 * @template T - The type of the field value.
 */
export interface FieldContext<T = unknown> {
    /** A unique identifier for the field (used for DOM element lookup). */
    id: string;

    /** The current value of the field. */
    value: T;

    /** Whether the field has been interacted with by the user. */
    touched: boolean;

    /** The Yup schema used to validate the field's value. */
    schema: Schema<T>;

    /**
     * How to query for errors: "absolute" for the exact path or "relative" for
     * the root field.
     */
    query: ErrorQuery;

    /** The initial value of the field (used for reset operations). */
    initial?: T;

    /**
     * Optional function to transform the field value before validation.
     *
     * @param value - The field's raw value.
     * @returns The transformed value to pass to the schema validator.
     */
    parse?: (value: T) => unknown;

    /**
     * Optional function to transform the field value for external serialization
     * (e.g., API submission).
     *
     * @param value - The field's raw value.
     * @returns The serialized value ready for submission.
     */
    serialize?: (value: T) => unknown;

    /**
     * Optional function to transform the field value specifically for FormData
     * serialization.
     *
     * @param value - The field's raw value.
     * @returns A string or Blob suitable for FormData.append().
     */
    serializeFormData?: (value: T) => string | Blob;
}

/** The context for an entire form, containing shared field and error stores. */
export interface FormContext {
    /** The form's unique name or identifier. */
    name: string;

    /** The shared FieldStore for managing all fields in this form. */
    fields: FieldStore;

    /** The shared ErrorStore for managing validation errors. */
    errors: ErrorStore;
}
