import type { CompoundType } from "../utils";

/**
 * Key-value map representing active filter values. Each value can be a
 * primitive or structured compound type.
 */
export type FilterType = Record<string, CompoundType>;

/** Allowed sort directions for sortable fields. */
export type OrderType = "asc" | "desc";

/** Descriptor for a sorting rule applied to a specific field. */
export interface SortType {
    /** Field name used for sorting */
    field: string;
    /** Sorting direction */
    order: OrderType;
}

/**
 * Signature of the callback invoked after parameters change.
 *
 * @param params Current resolved parameters.
 * @param encoded Pre-encoded version of the parameters (e.g. for URL usage).
 */
export type Callback = (params: ListerParams, encoded: string) => void;

/** Configuration options for the lister. */
export interface ListerOptions {
    /** Storage key namespace */
    name: string;
    /** Callback triggered after any parameter update */
    callback: Callback;
    /** Default initial parameters */
    defaults: Partial<ListerParams>;
    /** Whether to persist the limit value */
    rememberLimit: boolean;
    /** Whether to persist sorting rules */
    rememberSorts: boolean;
}

/** Active parameters used for querying or applying filters. */
export interface ListerParams {
    /** Current page index (1-based) */
    page: number;
    /** Page size */
    limit: number;
    /** Search text */
    search: string;
    /** List of sorting rules */
    sorts: SortType[];
    /** Active filter values */
    filters: FilterType;
}

/** Complete state returned by the lister after resolving response data. */
export interface ListerData<T, M> {
    /** Signature checksum of current parameters */
    sign: string;

    /** Current page index */
    page: number;
    /** Page size */
    limit: number;
    /** Search keyword */
    search: string;
    /** Active sorting rules */
    sorts: SortType[];
    /** Active filter values */
    filters: FilterType;

    /** Total number of matched results */
    total: number;
    /** Total number of pages */
    pages: number;
    /** Inclusive index of first item in current page */
    from: number;
    /** Inclusive index of last item in current page */
    to: number;

    /** Additional metadata from the response */
    meta: M;
    /** Array of records returned by the backend */
    records: T[];
}
