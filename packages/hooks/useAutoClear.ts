import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/** Element type that supports Select Range. */
type ClearableElement = Pick<
    HTMLInputElement,
    | "addEventListener"
    | "removeEventListener"
    | "selectionStart"
    | "setRangeText"
    | "dispatchEvent"
    | "value"
>;

/**
 * Hook that clears the input value when the Escape key is pressed. Supports
 * clearing only the portion around a separator if provided.
 *
 * @param element Reference to clearable element
 * @param separator Optional character to determine selection boundaries
 */
export function useAutoClear(
    element: ClearableElement | null,
    separator?: string
) {
    useIsomorphicLayoutEffect(() => {
        if (!element) return;

        const handler = (ev: KeyboardEvent) => {
            if (ev.code !== "Escape") return;

            let start = 0;
            let end = element.value.length;

            if (separator) {
                const pos = element.selectionStart ?? 0;

                // Find start boundary
                for (let i = pos - 1; i >= 0; i--) {
                    if (element.value[i] === separator) {
                        start = i;
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

            element.setRangeText("", start, end);
            element.dispatchEvent(
                new Event("input", { bubbles: true, cancelable: true })
            );
        };

        element.addEventListener("keydown", handler);

        return () => element.removeEventListener("keydown", handler);
    }, [element, separator]);
}
