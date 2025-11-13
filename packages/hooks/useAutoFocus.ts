import type { RefCallback } from "react";
import { useRefCallback } from "./useRefCallback";

/** Element type that supports focus. */
type FocusableElement = Pick<HTMLElement, "focus">;

/**
 * Hook that automatically focuses the given element when it mounts.
 *
 * @returns A ref callback to bind to the focusable element
 */
export function useAutoFocus(): RefCallback<FocusableElement> {
    const [ref] = useRefCallback<FocusableElement>((el) => {
        el.focus();
    });

    return ref;
}
