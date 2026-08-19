import { useCallback, useRef } from "react";

/**
 * Provides a mutable revision counter without triggering a re-render.
 *
 * The returned `revision` reads the current value, `newRevision` increments it,
 * and `checkRevision` checks whether a value is the current revision.
 *
 * @param initial The starting revision value. Defaults to `0`.
 * @returns Functions for reading, incrementing, and checking the revision.
 */
export function useRevision(initial = 0) {
    const ref = useRef(initial);

    const revision = useCallback(() => ref.current, []);

    const newRevision = useCallback(() => ++ref.current, []);

    const checkRevision = useCallback(
        (revision: number) => ref.current === revision,
        []
    );

    return { revision, newRevision, checkRevision };
}
