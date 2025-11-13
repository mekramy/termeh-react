import type { RefCallback } from "react";
import { useRefCallback } from "./useRefCallback";

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
 * @param separator Optional character to determine selection boundaries
 * @returns Ref callback for binding to input element
 */
export function useAutoClear(
    separator?: string
): RefCallback<ClearableElement> {
    const [ref] = useRefCallback<ClearableElement>((el) => {
        const handler = (ev: KeyboardEvent) => {
            if (ev.code !== "Escape") return;

            let start = 0;
            let end = el.value.length;

            if (separator) {
                const pos = el.selectionStart ?? 0;

                // Find start boundary
                for (let i = pos - 1; i >= 0; i--) {
                    if (el.value[i] === separator) {
                        start = i;
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

            el.setRangeText("", start, end);
            el.dispatchEvent(
                new Event("input", { bubbles: true, cancelable: true })
            );
        };

        el.addEventListener("keydown", handler);

        return () => el.removeEventListener("keydown", handler);
    });

    return ref;
}
