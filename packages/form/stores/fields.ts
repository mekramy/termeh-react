import type { FieldContext, FieldStore, FUNC } from "../types";

/**
 * Creates a FieldStore instance for managing form field state and context.
 *
 * The store maintains a map of field names to their contexts, handles value and
 * state updates, and provides subscription support for reactive updates when
 * field state changes.
 *
 * @returns A FieldStore object with methods for field registration, state
 *   management, and subscription.
 */
export function createFieldStore(): FieldStore {
    const state = new Map<string, FieldContext>();
    const subscribers = new Map<string, Set<FUNC>>();

    // Helpers
    const _notify = (field: string) =>
        subscribers.get(field)?.forEach((fn) => fn());

    const _notifyAll = () =>
        subscribers.forEach((set) => set.forEach((fn) => fn()));

    // Store API
    const getFields = () => state;

    const getSnapshot = (name: string) => state.get(name);

    const subscribe = (name: string, fn: FUNC) => {
        if (!subscribers.has(name)) {
            subscribers.set(name, new Set());
        }

        subscribers.get(name)!.add(fn);
        return () => subscribers.get(name)?.delete(fn);
    };

    // Fields API
    const reset = (values: Record<string, unknown>) => {
        for (const [field, value] of Object.entries(values)) {
            const context = state.get(field);
            if (context) {
                state.set(field, {
                    ...context,
                    touched: false,
                    value: value ?? context.initial,
                });
            }
        }

        _notifyAll();
    };

    const resetField = (name: string, value: unknown) => {
        const context = state.get(name);
        if (context) {
            state.set(name, {
                ...context,
                touched: false,
                value: value ?? context.initial,
            });

            _notify(name);
        }
    };

    const setField = <T = unknown>(name: string, context: FieldContext<T>) => {
        state.set(name, context as FieldContext<unknown>);
        _notify(name);
    };

    const setValue = (name: string, value: unknown) => {
        const field = state.get(name);
        if (!field) return;

        state.set(name, {
            ...field,
            value,
            touched: field.value !== value || field.touched,
        });
        _notify(name);
    };

    const getField = (name: string) => state.get(name);

    return {
        getFields,
        getSnapshot,
        subscribe,
        reset,
        resetField,
        setField,
        setValue,
        getField,
    };
}
