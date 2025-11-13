import { deepClone } from "./object";

/**
 * Defines the strategy for merging values at a specific configuration path.
 *
 * - `"merge"`: Performs a deep merge of nested objects.
 * - `"replace"`: Replaces the existing value with the new value.
 * - `"safe"`: Ignores the new value if it is `undefined`, preserving the existing
 *   value.
 */
export type MergeStrategy = "merge" | "replace" | "safe";

/**
 * A map of dot-separated paths to their corresponding merge strategies. For
 * example: `{ "theme.colors.primary": "replace" }`.
 *
 * Each key represents a path within the configuration object where the
 * associated strategy overrides the default behavior.
 */
export type MergeOptions = Record<string, MergeStrategy>;

/**
 * A utility type to make all properties of an object and its nested objects
 * optional. Useful for representing partial configuration shapes.
 *
 * Note: functions are left unchanged.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object
        ? T[P] extends (...args: unknown[]) => unknown
            ? T[P]
            : DeepPartial<T[P]>
        : T[P];
};

/**
 * Deeply merges a new partial configuration into a base configuration object.
 *
 * - This function is immutable: it does not modify the original `config`
 *   argument. Instead it returns a new object containing merged values.
 * - Arrays from `newConfig` always replace arrays in `config`.
 * - The `options` map can be used to specify per-path strategies (e.g.
 *   `"replace"` or `"safe"`).
 *
 * @template T - The configuration object type.
 * @param config - The base configuration object to merge into. It will be
 *   deep-cloned before merging to ensure immutability.
 * @param newConfig - A partial configuration object whose values will be
 *   applied on top of `config`.
 * @param options - Optional map of dot-separated paths to merge strategies.
 *   When omitted, the default behavior is to deep-merge nested plain objects,
 *   replace arrays, and ignore `undefined` values on non-object paths.
 * @returns A new configuration object containing the merged result.
 */
export function mergeConfig<T extends Record<string, unknown>>(
    config: T,
    newConfig: DeepPartial<T>,
    options?: MergeOptions
): T {
    const strategies = options ?? {};

    /**
     * Internal recursive function that merges properties from `source` into
     * `target`. This function mutates `target` directly; callers should ensure
     * `target` is a clone when immutability is required.
     *
     * Behavior summary:
     *
     * - If `source` is not an object or is an array, it will not be traversed.
     * - For each property in `source`:
     *
     *   - If the configured strategy for the path is `"safe"` and the source value
     *       is `undefined`, the property is skipped.
     *   - If the strategy is `"replace"` or the source value is an array, the
     *       target property is replaced with a deep clone of the source.
     *   - If both target and source values are non-null objects, they are
     *       deep-merged recursively.
     *   - Otherwise, the target property is replaced with a deep clone of the
     *       source value.
     *
     * @param target - The object being merged into (mutated).
     * @param source - The source object providing new values.
     * @param path - The current dot-separated path used to consult
     *   `strategies`.
     */
    function merge(target: any, source: any, path = ""): void {
        if (
            typeof source !== "object" ||
            source === null ||
            Array.isArray(source)
        ) {
            // Nothing to traverse for non-objects or arrays (arrays are replaced)
            return;
        }

        for (const key of Object.keys(source)) {
            const currentPath = path ? `${path}.${key}` : key;
            const strategy = strategies[currentPath];
            const sourceValue = source[key];
            const targetValue = target[key];

            // Safe strategy: do not overwrite with undefined
            if (strategy === "safe" && sourceValue === undefined) {
                continue;
            }

            // Default ignore for undefined primitive values when no explicit strategy
            if (typeof sourceValue !== "object" && sourceValue === undefined) {
                continue;
            }

            // Replace strategy or arrays: clone source value and assign
            if (strategy === "replace" || Array.isArray(sourceValue)) {
                target[key] = deepClone(sourceValue);
                continue;
            }

            // If both sides are plain objects (non-null), deep merge recursively
            if (
                typeof sourceValue === "object" &&
                sourceValue !== null &&
                typeof targetValue === "object" &&
                targetValue !== null &&
                !Array.isArray(targetValue)
            ) {
                merge(targetValue, sourceValue, currentPath);
            } else {
                // Fallback: replace with a cloned value from source
                target[key] = deepClone(sourceValue);
            }
        }
    }

    // Start with a deep-cloned base to preserve the original config object.
    const result = deepClone(config);
    merge(result, newConfig);
    return result;
}
