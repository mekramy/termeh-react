import { isArray, isObject } from "../../utils";
import type {
    ErrorQuery,
    ErrorStore,
    FieldErrors,
    FUNC,
    LocalizedMessages,
} from "../types";
import {
    asteriskPath,
    findMessage,
    flatternPath,
    parseYupErrors,
    rootPath,
} from "../utils";

/**
 * Creates an ErrorStore instance for managing form validation errors.
 *
 * The store handles error storage, localization, subscription-based updates,
 * and provides methods for parsing errors from various sources (Yup validation,
 * server responses, and manual invalidation).
 *
 * @returns An ErrorStore object with methods for error management, querying,
 *   and subscription.
 */
export function createErrorStore(): ErrorStore {
    // Store state
    let currentLocale: string | undefined = undefined;
    let currentMessages: LocalizedMessages = {};
    const state = new Map<string, FieldErrors>();
    const subscribers = new Map<string, Set<FUNC>>();

    // Helpers
    const _notify = (path: string) =>
        subscribers.get(path)?.forEach((fn) => fn());

    const _notifyAll = () =>
        subscribers.forEach((set) => set.forEach((fn) => fn()));

    const _translate = (path: string, rule: string, explicit?: string) => {
        if (explicit?.trim()) return explicit.trim();

        const loc = currentLocale;
        const messages = currentMessages;
        const flat = flatternPath(path);
        const asterisk = asteriskPath(path);

        return (
            findMessage(messages, flat, rule, loc) ??
            findMessage(messages, asterisk, rule, loc) ??
            rule
        );
    };

    const _push = (path: string, rule: string, message?: string) => {
        path = path.trim();
        rule = rule.trim();
        if (!path || !rule) return;

        const add = (k: string) => {
            const prev = state.get(k) ?? {};
            const next = {
                ...prev,
                [rule]: {
                    fixed: !!message?.trim(),
                    message: _translate(k, rule, message),
                },
            };
            state.set(k, next);
        };

        const root = rootPath(path);
        const flat = flatternPath(path);
        const asterisk = asteriskPath(path);

        add(root);
        if (root !== flat) add(flat);
        if (flat !== asterisk) add(asterisk);
    };

    const _clear = () => {
        state.clear();
    };

    const _clearField = (path: string) => {
        state.delete(flatternPath(path));
        state.delete(asteriskPath(path));
    };

    // Refresh
    const setLocalization = (
        messages: LocalizedMessages,
        locale: string | undefined
    ) => {
        currentLocale = locale;
        currentMessages = messages;
        for (const [path, errors] of state.entries()) {
            const next: FieldErrors = {};
            for (const [rule, data] of Object.entries(errors)) {
                next[rule] = data.fixed
                    ? data
                    : { fixed: false, message: _translate(path, rule) };
            }
            state.set(path, next);
        }
        _notifyAll();
    };

    // Store API
    const getErrors = () => state;

    const getSnapshot = (path: string, query: ErrorQuery = "relative") =>
        query === "absolute"
            ? (state.get(flatternPath(path)) ?? state.get(asteriskPath(path)))
            : state.get(rootPath(path));

    const subscribe = (path: string, fn: FUNC) => {
        if (!subscribers.has(path)) {
            subscribers.set(path, new Set());
        }

        subscribers.get(path)!.add(fn);
        return () => subscribers.get(path)?.delete(fn);
    };

    // Errors API
    const reset = () => {
        _clear();
        _notifyAll();
    };

    const clear = (path: string) => {
        _clearField(path);
        _notify(path);
    };

    const parseForm = (e: unknown) => {
        _clear();

        const errors = parseYupErrors(e);
        if (typeof errors === "object") {
            for (const [path, rules] of Object.entries(errors)) {
                if (!path.trim()) continue;

                const filtered = (Array.isArray(rules) ? rules : [])
                    .map((r) => (typeof r === "string" ? r.trim() : ""))
                    .filter(Boolean);
                for (const r of filtered) _push(path, r);
            }
        }

        _notifyAll();
    };

    const parseResponse = (e: unknown) => {
        _clear();
        if (isObject<Record<string, unknown>>(e)) {
            for (const [path, payload] of Object.entries(e)) {
                if (!path.trim()) continue;

                if (isObject<Record<string, string | undefined>>(payload)) {
                    for (const [rule, msg] of Object.entries(payload)) {
                        if (!rule.trim()) continue;
                        _push(path, rule, msg);
                    }
                } else if (isArray<string>(payload)) {
                    const filtered = payload
                        .map((x) => (typeof x === "string" ? x.trim() : x))
                        .filter(Boolean);
                    for (const r of filtered) _push(path, r);
                }
            }
        }

        _notifyAll();
    };

    const parseField = (path: string, e: unknown) => {
        _clearField(path);
        const errors = parseYupErrors(e);

        for (const rules of Object.values(errors)) {
            if (!isArray<string>(rules)) continue;

            const filtered = rules
                .map((r) => (typeof r === "string" ? r.trim() : ""))
                .filter(Boolean);
            for (const r of filtered) _push(path, r);
        }

        _notify(path);
    };

    const invalidate = (path: string, rule: string, message?: string) => {
        _push(path, rule, message);
        _notify(path);
    };

    return {
        getErrors,
        getSnapshot,
        subscribe,
        setLocalization,
        reset,
        clear,
        parseForm,
        parseResponse,
        parseField,
        invalidate,
    };
}
