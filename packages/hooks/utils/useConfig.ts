import { useCallback, useState } from "react";
import {
    deepClone,
    mergeConfig,
    type DeepPartial,
    type MergeOptions,
} from "../../utils";

/**
 * Manage a configuration object with deep merging.
 *
 * @param defaultConfig Initial config values
 * @returns An object with:
 *
 *   - `config`: Current configuration state
 *   - `set`: Merges a partial config into the current state
 */
export function useConfig<T extends Record<string, unknown>>(defaultConfig: T) {
    const [config, setConfig] = useState<T>(() => deepClone(defaultConfig));

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
