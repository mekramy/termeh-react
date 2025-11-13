import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
    useTransition,
} from "react";
import { ValidationError, type Schema } from "yup";
import { newId } from "../../utils";
import type { ErrorQuery, FormContext } from "../types";
import { resolveYupDefault } from "../utils";

/**
 * Configuration options for the useField hook.
 *
 * @template T - The field value type.
 */
interface FieldOptions<T = unknown> {
    /** The initial value for the field. Defaults to the schema's default value. */
    initial: T;

    /**
     * Debounce time in milliseconds before triggering validation on value
     * changes. Defaults to 0.
     */
    debounce: number;

    /**
     * When to trigger validation: "change" for on-change validation or "submit"
     * for form submission only.
     */
    trigger: "change" | "submit";

    /**
     * How to query errors: "absolute" for the exact field path or "relative"
     * for the root field.
     */
    query: ErrorQuery;

    /** Optional function to transform the field value before validation. */
    parse: (value: T) => unknown;

    /** Optional function to transform the field value for serialization. */
    serialize: (value: T) => unknown;

    /**
     * Optional function to transform the field value for FormData
     * serialization.
     */
    serializeFormData?: (value: T) => string | Blob;
}

/**
 * A React hook for managing individual form field state and validation.
 *
 * This hook integrates with the form context created by useForm, handles field
 * value changes, triggers validation based on configuration, and provides
 * access to field state and error information.
 *
 * @template T - The type of the field value. Defaults to unknown.
 * @param ctx - The FormContext from useForm, providing access to field and
 *   error stores.
 * @param name - The unique name/path for the field (e.g., "email",
 *   "user.name").
 * @param schema - The Yup schema used to validate the field value.
 * @param options - Optional configuration including initial value, debounce,
 *   validation trigger, etc.
 * @returns An object containing:
 *
 *   - `id`: The unique field identifier (for DOM element lookup).
 *   - `value`: The current field value.
 *   - `isTouched`: Whether the field has been interacted with.
 *   - `errors`: Array of error messages for the field.
 *   - `isValid`: Whether the field currently passes validation.
 *   - `isFailed`: Whether the field has validation errors.
 *   - `reset`: Function to reset the field to its initial value.
 *   - `onChange`: Function to update the field value and trigger validation.
 */
export function useField<T = unknown>(
    ctx: FormContext,
    name: string,
    schema: Schema<T>,
    options: Partial<FieldOptions<T>> = {}
) {
    // Options
    const { name: form, errors: _errors, fields: fields } = ctx;
    const {
        initial = resolveYupDefault(schema),
        debounce = 0,
        trigger = "change",
        query = "relative",
        parse,
        serialize,
        serializeFormData,
    } = options;

    // Stats
    const [, startTransition] = useTransition();
    const timerRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Subscribe to field and error stores
    const fieldSnap = useSyncExternalStore(
        (fn) => fields.subscribe(name, fn),
        () => fields.getSnapshot(name),
        () => fields.getSnapshot(name)
    );
    const errorSnap = useSyncExternalStore(
        (fn) => _errors.subscribe(name, fn),
        () => _errors.getSnapshot(name, query),
        () => _errors.getSnapshot(name, query)
    );

    // Register field
    useEffect(() => {
        fields.setField(name, {
            id: `${form}-${name}-${newId()}`,
            value: initial as T,
            touched: false,
            schema,
            query,
            initial: initial as T,
            parse,
            serialize,
            serializeFormData,
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            abortRef.current?.abort();
        };
    }, []);

    // Helpers
    const validate = useCallback(
        (value: T) => {
            // Abort previous validation
            abortRef.current?.abort();
            const ctl = new AbortController();
            abortRef.current = ctl;

            // Validation function
            const runValidation = async () => {
                try {
                    const parsed = parse ? parse(value) : value;
                    await schema.validate(parsed, {
                        strict: false,
                        abortEarly: false,
                        stripUnknown: true,
                    });

                    if (ctl.signal.aborted) return;
                    _errors.clear(name);
                } catch (e) {
                    if (ctl.signal.aborted) return;

                    if (e instanceof ValidationError) {
                        _errors.parseField(name, e);
                    } else {
                        _errors.clear(name);
                    }
                }
            };

            // Run timer
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(
                runValidation,
                debounce || 300
            );
        },
        [_errors, name, schema, parse, debounce]
    );

    // Derived state
    const id = fieldSnap?.id;
    const value = fieldSnap?.value as T;
    const isTouched = !!fieldSnap?.touched;

    // Computed value
    const errors = useMemo(
        () =>
            Object.values(errorSnap ?? {})
                .map((i) => i.message)
                .filter(Boolean),
        [errorSnap]
    );
    const isValid = useMemo(
        () => Object.keys(errorSnap ?? {}).length === 0,
        [errorSnap]
    );
    const isFailed = useMemo(
        () => Object.keys(errorSnap ?? {}).length > 0,
        [errorSnap]
    );

    // API
    const reset = useCallback(
        (value?: T) => {
            fields.resetField(name, value);
            _errors.clear(name);
        },
        [fields, _errors, name]
    );

    const onChange = useCallback(
        (value: T) => {
            fields.setValue(name, value);

            if (trigger === "change") {
                startTransition(() => validate(value));
            }
        },
        [fields, name, trigger, validate]
    );

    return useMemo(
        () => ({
            id,
            value,
            isTouched,
            errors,
            isValid,
            isFailed,
            reset,
            onChange,
        }),
        [id, value, isTouched, errors, isValid, isFailed, reset, onChange]
    );
}
