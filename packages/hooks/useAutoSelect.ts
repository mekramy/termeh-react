import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

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
 * @param element Reference to selectable element
 * @param separator Optional string to determine selection boundaries
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
