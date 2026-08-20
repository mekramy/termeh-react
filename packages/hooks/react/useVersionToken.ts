import { useCallback, useRef } from "react";
import { useOnUnmount } from "./useOnUnmount";

interface UseVersionTokenOptions {
    /** Invalidates the current version when the component unmounts. */
    invalidateOnUnmount?: boolean;
}

/**
 * Provides a mutable version token without triggering a re-render.
 *
 * Call `nextVersion` to create a new version and `verifyVersion` to check
 * whether a version is still current.
 *
 * @param options Options for version invalidation.
 * @returns Functions for creating and verifying versions.
 */
export function useVersionToken({
    invalidateOnUnmount,
}: UseVersionTokenOptions = {}) {
    const versionRef = useRef(0);

    const nextVersion = useCallback(() => ++versionRef.current, []);

    const verifyVersion = useCallback(
        (v: number) => v === versionRef.current,
        []
    );

    useOnUnmount(() => {
        if (invalidateOnUnmount) nextVersion();
    });

    return { nextVersion, verifyVersion };
}
