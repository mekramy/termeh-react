/**
 * Public utilities barrel for the `@termeh/utils` package.
 *
 * This module re-exports small, focused helper utilities used across the
 * project. Import from this file when you need common helpers such as:
 *
 * - ID and cloning helpers (`newId`, `deepClone`) from `common`
 * - DOM utilities (`getMetaContent`, `copyToClipboard`) from `dom`
 * - Form file helpers (`getFormFile`, `getFormFiles`) from `form`
 * - Inline HTML builder (`Inliner`) from `inliner`
 * - Deep merge helper (`mergeConfig`) from `merge`
 * - Number, string, time and type utilities from their respective modules
 *
 * Example: import { newId, parseNumber, Inliner } from './utils';
 *
 * - Use @param for parameters
 * - Use @returns for return values
 */
export * from "./common";
export * from "./dom";
export * from "./form";
export * from "./inliner";
export * from "./merge";
export * from "./number";
export * from "./string";
export * from "./time";
export * from "./type";
