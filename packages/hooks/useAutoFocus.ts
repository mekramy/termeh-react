import { useIsomorphicLayoutEffect } from "./shared";

/** Element type that supports focus. */
type FocusableElement = Pick<HTMLElement, "focus">;

/**
 * Hook that automatically focuses the given element when it mounts.
 *
 * @param element Reference to focusable element
 */
export function useAutoFocus(element: FocusableElement | null) {
    useIsomorphicLayoutEffect(() => {
        element?.focus();
    }, [element]);
}
