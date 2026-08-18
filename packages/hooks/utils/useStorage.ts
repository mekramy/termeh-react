import { useCallback, useMemo, useState } from "react";

/**
 * Creates a namespaced storage helper for a Storage implementation.
 *
 * Keys are normalized and optionally prefixed before access. The returned API
 * provides safe read and write helpers for string, number, and boolean values.
 *
 * @param storage - Storage-like instance used for persistence, such as
 *   `localStorage`, `sessionStorage`, or a custom storage object.
 * @param prefix - Optional key prefix. Defaults to `""`.
 * @returns A storage API with:
 *
 *   - `string(key)`: returns the trimmed stored string or `undefined`.
 *   - `number(key)`: returns the parsed number or `undefined`.
 *   - `boolean(key)`: returns `true` or `false` for supported values, otherwise
 *       `undefined`.
 *   - `set(key, value)`: stores a string value and returns `true` on success.
 *   - `remove(key)`: removes a key and returns `true` on success.
 */
export function useStorage(storage: Storage, prefix?: string) {
    prefix = prefix?.trim() ?? "";
    const [version, setVersion] = useState(0);

    const isValid = useMemo(() => {
        return (
            typeof storage !== "undefined" &&
            typeof storage.getItem === "function" &&
            typeof storage.setItem === "function" &&
            typeof storage.removeItem === "function"
        );
    }, [storage]);

    const string = useCallback(
        (key: string): string | undefined => {
            key = normalizeKeys(key);
            if (!key || !isValid) return undefined;

            try {
                const value = storage.getItem(normalizeKeys(prefix!, key));
                return value?.trim() ?? undefined;
            } catch {
                return undefined;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isValid, storage, prefix, version]
    );

    const number = useCallback(
        (key: string): number | undefined => {
            const value = Number(string(key));
            return isFinite(value) ? value : undefined;
        },
        [string]
    );

    const boolean = useCallback(
        (key: string): boolean | undefined => {
            const value = string(key);
            if (value === "true" || value === "1") return true;
            if (value === "false" || value === "0") return false;
            return undefined;
        },
        [string]
    );

    const set = useCallback(
        (key: string, value: string | undefined): boolean => {
            key = normalizeKeys(key);
            value = (value ?? "").trim();

            if (!isValid || !key || !value) return false;

            try {
                storage.setItem(normalizeKeys(prefix!, key), value);
                setVersion((v) => v + 1);
                return true;
            } catch {
                return false;
            }
        },
        [isValid, storage, prefix]
    );

    const remove = useCallback(
        (key: string): boolean => {
            key = normalizeKeys(key);
            if (!isValid || !key) return false;

            try {
                storage.removeItem(normalizeKeys(prefix!, key));
                setVersion((v) => v + 1);
                return true;
            } catch {
                return false;
            }
        },
        [isValid, storage, prefix]
    );

    return {
        set,
        remove,
        string,
        number,
        boolean,
    };
}

function normalizeKeys(...keys: string[]): string {
    const result: string[] = [];
    for (let key of keys) {
        key = key.trim().replace(/\s+/g, "::");
        if (key) result.push(key);
    }
    return result.join("::").replace(/(::)+/g, "::");
}
