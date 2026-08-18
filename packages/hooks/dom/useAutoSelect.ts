import { useIsomorphicLayoutEffect } from "../react";

type SelectableElement = Pick<
    HTMLInputElement,
    | "addEventListener"
    | "removeEventListener"
    | "selectionStart"
    | "setSelectionRange"
    | "value"
>;

/**
 * Automatically selects the current value segment when the input is clicked.
 *
 * When `separator` is provided, the selection is limited to the segment between
 * the nearest separator before and after the caret position.
 *
 * @param element - Selectable input element. Defaults to `null`.
 * @param separator - Separator used to detect segment boundaries. Defaults to
 *   `undefined`.
 */
export function useAutoSelect(
    element: SelectableElement | null,
    separator?: string
) {
    useIsomorphicLayoutEffect(() => {
        if (!element) return;

        const handler = () => {
            let start = 0;
            let end = element.value.length;

            if (separator) {
                const pos = element.selectionStart ?? 0;

                // Find start boundary
                for (let i = pos - 1; i >= 0; i--) {
                    if (element.value[i] === separator) {
                        start = i + 1;
                        break;
                    }
                }

                // Find end boundary
                for (let i = pos; i < element.value.length; i++) {
                    if (element.value[i] === separator) {
                        end = i;
                        break;
                    }
                }
            }

            element.setSelectionRange(start, end, "forward");
        };

        element.addEventListener("click", handler);

        return () => element.removeEventListener("click", handler);
    }, [element, separator]);
}
