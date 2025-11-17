import { useCallback, useMemo, useRef, useState } from "react";
import { useStorage } from "../hooks";
import { sign, validate } from "../signer";
import { isObject } from "../utils";
import type {
    Callback,
    ListerData,
    ListerOptions,
    ListerParams,
} from "./types";
import {
    arraySafe,
    decode,
    decodeSorts,
    encode,
    encodeSorts,
    objectSafe,
    positiveSafe,
    removeZero,
    stringSafe,
} from "./utils";

/**
 * React hook to manage paginated, sortable, and filterable list state.
 *
 * This hook provides a fully reactive interface for managing list data,
 * including pagination (`page`, `limit`), searching (`search`), sorting
 * (`sorts`), filtering (`filters`), and API response handling (`meta`,
 * `records`). It also persists certain state values to localStorage if
 * configured.
 *
 * The hook ensures safe async updates with a lock to prevent race conditions
 * during concurrent `apply` or `parseResponse` calls.
 *
 * @example
 *     const { page, limit, search, filters, records, apply, parseResponse } =
 *         useLister<{ id: number; name: string }, { totalCount: number }>({
 *             name: "users",
 *             defaults: { page: 1, limit: 20 },
 *             callback: (params, encoded) => console.log(params, encoded),
 *         });
 *
 *     // Apply filters
 *     apply({ page: 2, search: "john" });
 *
 *     // Parse API response
 *     parseResponse(apiResponse);
 *
 * @template TRecord - Type of individual records in the list.
 * @template TMeta - Type of metadata object for the list.
 * @param options - Optional configuration object:
 * @param options.name - Key prefix for localStorage persistence.
 * @param options.defaults - Default values for `page`, `limit`, `search`,
 *   `sorts`, and `filters`.
 * @param options.callback - Function called whenever filters are applied;
 *   receives current params and encoded string.
 * @param options.rememberLimit - Whether to persist `limit` to localStorage.
 * @param options.rememberSorts - Whether to persist `sorts` to localStorage.
 * @returns An object containing:
 *
 *   - **page, limit, search, sort, sorts, filters, isFiltered**: reactive filter
 *       and pagination state.
 *   - **total, pages, from, to, meta, records**: reactive data and aggregation info
 *       from API responses.
 *   - **filter(name: string)**: helper to get a single filter value.
 *   - **apply(filters: Partial<ListerParams>)**: applies new filter values and
 *       updates state & storage.
 *   - **parseUrl(encoded: string)**: decodes a URL-encoded filter string and
 *       applies it.
 *   - **parseResponse(response: unknown)**: parses an API response and updates
 *       state accordingly.
 */
export function useLister<TRecord = unknown, TMeta = unknown>(
    options: Partial<ListerOptions> = {}
) {
    // Options
    const {
        name = "",
        defaults = {},
        callback = null,
        rememberLimit = true,
        rememberSorts = true,
    } = options;

    // Storage
    const storage = useStorage(localStorage, `${name} lister`);

    // Initializer
    const initial = (): ListerData<TRecord, TMeta> => {
        const storedLimit = storage.number("limit");
        const storedSorts = decodeSorts(storage.string("sorts") ?? "");

        return {
            page: 1,
            limit: 20,
            search: "",
            sorts: [],
            filters: {},
            ...removeZero(defaults),
            ...removeZero({
                limit: rememberLimit ? storedLimit : undefined,
                sorts:
                    rememberSorts && storedSorts.length
                        ? storedSorts
                        : undefined,
            }),

            sign: "",
            total: 0,
            pages: 0,
            from: 0,
            to: 0,
            meta: {} as TMeta,
            records: [] as unknown[] as TRecord[],
        };
    };

    // Stats and Refs
    const [stats, setStats] = useState<ListerData<TRecord, TMeta>>(initial);
    const lockRef = useRef<boolean>(false);
    const callbackRef = useRef<Callback | null>(callback);
    const statsRef = useRef<ListerData<TRecord, TMeta>>(stats);

    // keep callbackRef up-to-date
    callbackRef.current = callback;

    // Helpers
    const persistStats = useCallback(
        (
            updater:
                | ((
                      prev: ListerData<TRecord, TMeta>
                  ) => ListerData<TRecord, TMeta>)
                | ListerData<TRecord, TMeta>
        ) => {
            if (typeof updater === "function") {
                setStats((prev) => {
                    const next = updater(prev);
                    statsRef.current = next;
                    return next;
                });
            } else {
                setStats(() => {
                    statsRef.current = updater;
                    return updater;
                });
            }
        },
        []
    );

    const persistStore = useCallback(
        (next: Partial<ListerParams>) => {
            const limit = positiveSafe(next.limit, 0)!;
            const sorts = arraySafe(next.sorts, [])!;

            if (rememberLimit && limit > 0) {
                storage.set("limit", String(limit));
            } else {
                storage.remove("limit");
            }

            if (rememberSorts && sorts.length > 0) {
                storage.set("sorts", encodeSorts(sorts));
            } else {
                storage.remove("sorts");
            }
        },
        [rememberLimit, rememberSorts, storage]
    );

    // APIs
    const reset = useCallback(async () => {
        const init = initial();
        // Sign
        const next = {
            page: init.page,
            limit: init.limit,
            search: init.search,
            sorts: init.sorts,
            filters: { ...init.filters },
        };

        // Update stats
        const signature = await sign(next);
        persistStats((prev) => {
            const merged = {
                ...prev,
                ...next,
                total: 0,
                pages: 0,
                from: 0,
                to: 0,
                meta: {} as TMeta,
                records: [] as unknown[] as TRecord[],
                sign: signature,
            };
            statsRef.current = merged;
            return merged;
        });
        persistStore(next);

        // Notify
        callbackRef.current?.(next, encode(next));
    }, []);

    const apply = useCallback(
        async (filters: Partial<ListerParams>) => {
            if (lockRef.current) return;

            lockRef.current = true;
            try {
                // Parse Filters
                const next = {
                    page: statsRef.current.page,
                    limit: statsRef.current.limit,
                    search: statsRef.current.search,
                    sorts: statsRef.current.sorts,
                    filters: { ...statsRef.current.filters },
                    ...removeZero({
                        page: positiveSafe(filters.page, undefined),
                        limit: positiveSafe(filters.limit, undefined),
                        search: stringSafe(filters.search, undefined),
                        sorts: arraySafe(filters.sorts, undefined),
                        filters: objectSafe(filters.filters, undefined),
                    }),
                };

                const isSame = await validate(next, statsRef.current.sign);
                if (isSame) return;

                // Update stats
                const signature = await sign(next);
                persistStats((prev) => {
                    const merged = { ...prev, ...next, sign: signature };
                    statsRef.current = merged;
                    return merged;
                });
                persistStore(next);

                // Notify
                callbackRef.current?.(next, encode(next));
            } finally {
                lockRef.current = false;
            }
        },
        [persistStats, persistStore]
    );

    const parseUrl = useCallback(
        (encoded: string) => {
            void apply(decode(encoded));
        },
        [apply]
    );

    const parseResponse = useCallback(
        async (response: unknown) => {
            if (lockRef.current) return;

            lockRef.current = true;
            try {
                // Reset on invalid response
                if (!isObject<Record<string, unknown>>(response)) {
                    persistStats((prev) => {
                        const merged = {
                            ...prev,
                            total: 0,
                            pages: 0,
                            from: 0,
                            to: 0,
                            meta: {} as TMeta,
                            records: [] as unknown as TRecord[],
                        };
                        statsRef.current = merged;
                        return merged;
                    });
                    return;
                }

                // Parse Filters
                const next = {
                    page: statsRef.current.page,
                    limit: statsRef.current.limit,
                    search: statsRef.current.search,
                    sorts: statsRef.current.sorts,
                    filters: { ...statsRef.current.filters },
                    ...removeZero({
                        page: positiveSafe(response.page, undefined),
                        limit: positiveSafe(response.limit, undefined),
                        search: stringSafe(response.search, undefined),
                        sorts: arraySafe(response.sorts, undefined),
                    }),
                };

                const isSame = await validate(next, statsRef.current.sign);
                if (isSame) return;

                // Parse Metadata
                const meta: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(response)) {
                    if (
                        ![
                            "page",
                            "limit",
                            "search",
                            "sorts",
                            "total",
                            "pages",
                            "from",
                            "to",
                            "data",
                        ].includes(key)
                    ) {
                        meta[key] = value;
                    }
                }

                // Update stats
                const signature = await sign(next);
                persistStats((prev) => {
                    const merged = {
                        ...prev,
                        ...next,
                        total: positiveSafe(response.total, 0)!,
                        pages: positiveSafe(response.pages, 0)!,
                        from: positiveSafe(response.from, 0)!,
                        to: positiveSafe(response.to, 0)!,
                        meta: meta as TMeta,
                        records: arraySafe<TRecord>(
                            response.data,
                            [] as TRecord[]
                        )!,
                        sign: signature,
                    };
                    statsRef.current = merged;
                    return merged;
                });
                persistStore(next);

                // Notify
                callbackRef.current?.(next, encode(next));
            } finally {
                lockRef.current = false;
            }
        },
        [persistStats, persistStore]
    );

    const filter = useCallback(
        <T = unknown>(name: string): T | undefined =>
            stats.filters[name] as T | undefined,
        [stats]
    );

    // derived read-only selectors memoized to avoid returning new objects unnecessarily
    const lister = useMemo(
        () => ({
            page: stats.page,
            limit: stats.limit,
            search: stats.search,
            sort: stats.sorts.length > 0 ? stats.sorts[0] : undefined,
            sorts: stats.sorts,
            filters: stats.filters,
            isFiltered: Object.keys(stats.filters).length > 0,
            total: stats.total,
            pages: stats.pages,
            from: stats.from,
            to: stats.to,
            meta: stats.meta,
            records: stats.records,
        }),
        [
            stats.page,
            stats.limit,
            stats.search,
            stats.sorts,
            stats.filters,
            stats.total,
            stats.pages,
            stats.from,
            stats.to,
            stats.meta,
            stats.records,
        ]
    );

    return {
        ...lister,
        reset,
        apply,
        parseUrl,
        parseResponse,
        filter,
    } as const;
}
