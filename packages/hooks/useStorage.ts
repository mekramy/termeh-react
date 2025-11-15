import { useCallback, useMemo, useState } from "react";

/**
 * Creates a namespaced storage utility.
 *
 * Provides safe access to a Storage object (localStorage, sessionStorage, or
 * custom).
 *
 * @param storage - A Storage-like object.
 * @param prefix - Optional prefix for all keys. Empty prefix is allowed.
 * @returns Methods to read, write, and remove items safely.
 */
export function useStorage(storage: Storage, prefix?: string) {
    // Normalize and stats
    prefix = prefix ?? "";
    prefix = prefix.trim();
    const [tick, setTick] = useState(0);

    // Computed
    const isValid = useMemo(() => {
        return (
            typeof storage !== "undefined" &&
            typeof storage.getItem === "function" &&
            typeof storage.setItem === "function" &&
            typeof storage.removeItem === "function"
        );
    }, [storage]);

    // Helpers
    /**
     * Normalizes key parts by trimming, replacing spaces with '::', and
     * collapsing duplicates.
     *
     * @param keys - One or more key segments.
     * @returns Normalized key string, or empty string if invalid.
     */
    const normalize = (...keys: string[]): string => {
        const result: string[] = [];
        for (let key of keys) {
            key = key.trim().replace(/\s+/g, "::");
            if (key) result.push(key);
        }
        return result.join("::").replace(/(::)+/g, "::");
    };

    // API
    /**
     * Reads a string value by key.
     *
     * @param key - Key to read.
     * @returns Trimmed string value or undefined if missing/invalid.
     */
    const string = useCallback(
        (key: string): string | undefined => {
            // Normalize key
            key = normalize(key);
            if (!key || !isValid) return undefined;

            try {
                const value = storage.getItem(normalize(prefix!, key));
                return value?.trim() ?? undefined;
            } catch {
                return undefined;
            }
        },
        [isValid, storage, prefix, tick]
    );

    /**
     * Reads a numeric value by key.
     *
     * @param key - Key to read.
     * @returns Parsed number or undefined if invalid/unavailable.
     */
    const number = useCallback(
        (key: string): number | undefined => {
            const value = Number(string(key));
            return isFinite(value) ? value : undefined;
        },
        [string]
    );

    /**
     * Reads a boolean value by key. Accepts "true" or "1" as true, "false" or
     * "0" as false.
     *
     * @param key - Key to read.
     * @returns Boolean or undefined if invalid/unavailable.
     */
    const boolean = useCallback(
        (key: string): boolean | undefined => {
            const value = string(key);
            if (value === "true" || value === "1") return true;
            if (value === "false" || value === "0") return false;
            return undefined;
        },
        [string]
    );

    /**
     * Stores a string value under a key. Empty, null, or undefined values are
     * ignored.
     *
     * @param key - Key to store.
     * @param value - Value to store.
     * @returns True if stored successfully, false otherwise.
     */
    const set = useCallback(
        (key: string, value: string | undefined): boolean => {
            key = normalize(key);
            value = (value ?? "").trim();
            if (!isValid || !key || !value) return false;

            try {
                storage.setItem(normalize(prefix!, key), value);
                setTick((v) => v + 1);
                return true;
            } catch {
                return false;
            }
        },
        [isValid, storage, prefix]
    );

    /**
     * Removes a key/value pair.
     *
     * @param key - Key to remove.
     * @returns True if removed successfully, false otherwise.
     */
    const remove = useCallback(
        (key: string): boolean => {
            key = normalize(key);
            if (!isValid || !key) return false;

            try {
                storage.removeItem(normalize(prefix!, key));
                setTick((v) => v + 1);
                return true;
            } catch {
                return false;
            }
        },
        [isValid, storage, prefix]
    );

    return useMemo(
        () => ({
            set,
            remove,
            string,
            number,
            boolean,
        }),
        [set, remove, string, number, boolean]
    );
}
