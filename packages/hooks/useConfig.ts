import { useCallback, useState } from "react";
import {
    deepClone,
    mergeConfig,
    type DeepPartial,
    type MergeOptions,
} from "../utils";

/**
 * React hook for managing a configuration object with deep merging.
 *
 * @template T Type of the configuration object
 * @param defaultConfig Base configuration object
 * @returns
 *
 *   - `config`: Current configuration state
 *   - `set`: Function to merge a partial configuration
 */
export function useConfig<T extends Record<string, unknown>>(defaultConfig: T) {
    // Stats
    const [config, setConfig] = useState<T>(() => deepClone(defaultConfig));

    /**
     * Merge a new partial configuration into the config.
     *
     * @param newConfig Partial configuration object
     * @param options Optional per-path merge strategies
     */
    const set = useCallback(
        (newConfig: DeepPartial<T>, options?: MergeOptions) => {
            setConfig((prevConfig) =>
                mergeConfig(prevConfig, newConfig, options)
            );
        },
        []
    );

    return { config, set };
}
