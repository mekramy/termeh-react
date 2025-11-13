import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { object, ValidationError } from "yup";
import { createErrorStore } from "../stores/errors";
import { createFieldStore } from "../stores/fields";
import type { FormContext, LocalizedMessages } from "../types";
import { resetLocale } from "../utils";

/** Configuration options for the useForm hook. */
export interface FormOptions {
    /** The current locale code for localizing validation error messages. */
    locale: string;

    /**
     * Whether to automatically scroll to the first field with validation errors
     * after form submission.
     */
    scrollToError: boolean;
}

/**
 * A React hook for managing form state, validation, and error handling.
 *
 * This hook creates a form context with field and error stores, handles
 * validation, and provides utilities for parsing form data and server
 * responses.
 *
 * @param name - A unique name or identifier for the form.
 * @param messages - Localized error messages for validation rules.
 * @param options - Optional configuration including locale and scrollToError
 *   behavior.
 * @returns An object containing:
 *
 *   - `ctx`: The FormContext for use with field components.
 *   - `reset`: Function to reset all fields to initial values.
 *   - `parseResponse`: Function to parse server error responses.
 *   - `validate`: Async function to validate the entire form.
 */
export function useForm(
    name: string,
    messages: LocalizedMessages,
    options: Partial<FormOptions> = {}
) {
    resetLocale();

    // Options
    const { locale, scrollToError = true } = options;

    // Stats
    const abortRef = useRef<AbortController | null>(null);
    const [scrollPending, setScrollPending] = useState(false);

    // Create field and error stores
    const fields = useMemo(() => createFieldStore(), []);
    const errors = useMemo(() => createErrorStore(), []);

    // Helpers
    const getSchema = useCallback(
        () =>
            object(
                Object.fromEntries(
                    Array.from(fields.getFields().entries()).map(
                        ([name, field]) => [name, field.schema]
                    )
                )
            ),
        [fields]
    );

    const getParsed = useCallback(
        () =>
            Object.fromEntries(
                Array.from(fields.getFields().entries()).map(
                    ([name, field]) => [
                        name,
                        field.parse ? field.parse(field.value) : field.value,
                    ]
                )
            ),
        [fields]
    );

    const getSerialized = useCallback(
        () =>
            Object.fromEntries(
                Array.from(fields.getFields().entries()).map(
                    ([name, field]) => [
                        name,
                        field.serialize
                            ? field.serialize(field.value)
                            : field.value,
                    ]
                )
            ),
        [fields]
    );

    const getFormData = useCallback((): FormData => {
        const data = new FormData();
        for (const [name, field] of fields.getFields()) {
            if (field.serializeFormData) {
                data.append(name, field.serializeFormData(field.value));
                continue;
            }

            const value = field.serialize
                ? field.serialize(field.value)
                : field.value;

            if (value instanceof File) {
                data.append(name, value);
            } else if (
                value instanceof FileList ||
                (Array.isArray(value) && value.every((v) => v instanceof File))
            ) {
                Array.from(value).forEach((file) => {
                    data.append(name, file);
                });
            } else if (value === null || value === undefined) {
                data.append(name, "null");
            } else if (typeof value === "object") {
                data.append(name, JSON.stringify(value));
            } else {
                data.append(name, String(value));
            }
        }
        return data;
    }, [fields]);

    // Update localization messages
    useEffect(() => {
        errors.setLocalization(messages, locale);
    }, [errors, messages, locale]);

    // Scroll to first error after validation
    useEffect(() => {
        if (scrollPending) {
            requestAnimationFrame(() => {
                for (const [name, field] of fields.getFields()) {
                    const el =
                        document.getElementById(field.id) ??
                        document.querySelector(`[data-id="${field.id}"]`);

                    if (
                        !el ||
                        Object.keys(errors.getSnapshot(name, field.query) ?? {})
                            .length === 0
                    )
                        continue;

                    el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    el.focus();
                    break;
                }
            });
            setScrollPending(false);
        }
    }, [scrollPending, fields, errors]);

    // Computed values
    const ctx = useMemo<FormContext>(
        () => ({
            name,
            fields,
            errors,
        }),
        [name, fields, errors]
    );

    // API
    const reset = useCallback(
        (values: Record<string, unknown>) => {
            fields.reset(values);
            errors.reset();
        },
        [fields, errors]
    );

    const parseResponse = useCallback(
        (e: unknown) => {
            errors.parseResponse(e);
        },
        [errors]
    );

    const validate = useCallback(
        async (formData: boolean = false) => {
            // Abort previous validation
            abortRef.current?.abort();
            const ctl = new AbortController();
            abortRef.current = ctl;

            // Validation
            try {
                await getSchema().validate(getParsed(), {
                    strict: false,
                    abortEarly: false,
                    stripUnknown: true,
                });

                if (ctl.signal.aborted) {
                    return { canceled: true };
                }

                errors.reset();
                return {
                    data: formData ? getFormData() : getSerialized(),
                };
            } catch (e) {
                if (ctl.signal.aborted) {
                    return { canceled: true };
                }

                if (e instanceof ValidationError) {
                    errors.parseForm(e);
                    setScrollPending(scrollToError);
                    return { invalid: true };
                } else {
                    return { error: e };
                }
            }
        },
        [
            errors,
            getSchema,
            getParsed,
            getSerialized,
            getFormData,
            scrollToError,
        ]
    );

    return useMemo(
        () => ({
            ctx,
            reset,
            parseResponse,
            validate,
        }),
        [ctx, reset, parseResponse, validate]
    );
}
