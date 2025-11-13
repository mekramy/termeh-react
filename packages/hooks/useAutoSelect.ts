import type { RefCallback } from "react";
import { useRefCallback } from "./useRefCallback";

/** Element type that supports text selection. */
type SelectableElement = Pick<
    HTMLInputElement,
    | "addEventListener"
    | "removeEventListener"
    | "selectionStart"
    | "setSelectionRange"
    | "value"
>;

/**
 * Hook that auto-selects the input value when clicked. Optionally restricts
 * selection boundaries using a separator.
 *
 * @param separator Optional string to determine selection boundaries
 * @returns A ref callback for binding to the input element
 */
export function useAutoSelect(
    separator?: string
): RefCallback<SelectableElement> {
    const [ref] = useRefCallback<SelectableElement>((el) => {
        const handler = () => {
            let start = 0;
            let end = el.value.length;

            if (separator) {
                const pos = el.selectionStart ?? 0;

                // Find start boundary
                for (let i = pos - 1; i >= 0; i--) {
                    if (el.value[i] === separator) {
                        start = i + 1;
                        break;
                    }
                }

                // Find end boundary
                for (let i = pos; i < el.value.length; i++) {
                    if (el.value[i] === separator) {
                        end = i;
                        break;
                    }
                }
            }

            el.setSelectionRange(start, end, "forward");
        };

        el.addEventListener("click", handler);

        return () => el.removeEventListener("click", handler);
    });

    return ref;
}
