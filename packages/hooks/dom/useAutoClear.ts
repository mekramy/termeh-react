import { useIsomorphicLayoutEffect } from "../react";

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
 * Clears the current input value or the current segment when Escape is pressed.
 *
 * When a separator is provided, the hook clears only the segment surrounding
 * the cursor position, bounded by the nearest separator characters.
 *
 * @param element - Target input-like element to listen to.
 * @param separator - Optional separator used to detect the active segment.
 *   Default: no separator, so the whole input value is cleared.
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
