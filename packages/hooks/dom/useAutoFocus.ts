import { useIsomorphicLayoutEffect } from "../react";

type FocusableElement = Pick<HTMLElement, "focus">;

/**
 * Focuses the given element after it mounts.
 *
 * @param element - The focusable element to focus. Defaults to `null`, which
 *   skips focusing.
 */
export function useAutoFocus(element: FocusableElement | null) {
    useIsomorphicLayoutEffect(() => {
        element?.focus();
    }, [element]);
}
