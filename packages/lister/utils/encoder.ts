import { isArray, isObject } from "../../utils";
import type { ListerParams } from "../types";
import { arraySafe, positiveSafe, stringSafe } from "./safe";
import {
    decodeArray,
    decodeObject,
    decodeSorts,
    decodeValue,
    encodeArray,
    encodeObject,
    encodeSorts,
    encodeValue,
    inferType,
} from "./utils";

/**
 * Encodes a {@link ListerParams} object into a compact URL querystring.
 *
 * Rules:
 *
 * - Numeric values (page, limit) are stored only if positive.
 * - Empty strings are omitted.
 * - Sorts are encoded using {@link encodeSorts}.
 * - Filters are encoded based on their type:
 *
 *   - Arrays → {@link encodeArray}
 *   - Objects → {@link encodeObject}
 *   - Primitive values → {@link encodeValue}
 *
 * @returns A URLSearchParams-compatible serialized string.
 */
export function encode(state: ListerParams): string {
    const page = positiveSafe(state.page, 0)!;
    const limit = positiveSafe(state.limit, 0)!;
    const search = stringSafe(state.search, "")!;
    const sorts = arraySafe(state.sorts, [])!;

    const params = new URLSearchParams();

    if (page > 0) params.set("page", String(page));
    if (limit > 0) params.set("limit", String(limit));
    if (search.length > 0) params.set("search", String(search));
    if (sorts.length > 0) params.set("sorts", encodeSorts(sorts));

    for (const [k, v] of Object.entries(state.filters)) {
        if (isArray(v)) params.set(k, encodeArray(v));
        else if (isObject(v)) params.set(k, encodeObject(v));
        else params.set(k, encodeValue(v));
    }

    return params.toString();
}

/**
 * Decodes a querystring into a {@link ListerParams} object.
 *
 * Decoding rules:
 *
 * - `page`, `limit`, `search`, `sorts` are handled explicitly.
 * - Remaining entries are treated as filters:
 *
 *   - Comma-separated values without ":" → array filters
 *   - Key:value pairs → object filters
 *   - Otherwise → inferred primitive via {@link inferType}
 *
 * @param query Raw querystring (with or without leading `?`)
 */
export function decode(query: string): ListerParams {
    const params = new URLSearchParams(query);

    const state: ListerParams = {
        page: positiveSafe(params.get("page"), 0)!,
        limit: positiveSafe(params.get("limit"), 0)!,
        search: stringSafe(params.get("search"), "")!.trim(),
        sorts: decodeSorts(stringSafe(params.get("sorts"), "")!),
        filters: {},
    };

    for (const [key, value] of params.entries()) {
        if (["page", "limit", "search", "sorts"].includes(key)) continue;

        const filter = decodeValue(key).trim();
        if (!filter) continue;

        if (value.includes(",") && !value.includes(":")) {
            state.filters[filter] = decodeArray(value);
        } else if (value.includes(":")) {
            state.filters[filter] = decodeObject(value);
        } else {
            state.filters[filter] = inferType(value);
        }
    }

    return state;
}
