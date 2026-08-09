import { useEffect, useRef } from "react";
import { IS_SSR } from "../utils";
import { useStableCallback } from "./useStableCallback";

/**
 * Registers global keyboard shortcuts and executes a handler when matched.
 *
 * @param shortcut - A string (e.g., "ctrl+s") or an array of shortcut strings.
 * @param handler - Callback executed when the shortcut is pressed.
 * @param options - Optional settings for event handling.
 */
export function useShortcut(
    shortcut: string | string[],
    handler: (e: KeyboardEvent) => void,
    options: { prevent?: boolean; stop?: boolean } = {}
) {
    // Options
    const { prevent = false, stop = false } = options;
    const shortcuts = useRef(
        (Array.isArray(shortcut) ? shortcut : [shortcut])
            .map((s) => s.toLowerCase().split("+"))
            .map((parts) => ({
                ctrl: parts.includes("ctrl"),
                shift: parts.includes("shift"),
                alt: parts.includes("alt"),
                meta: parts.includes("meta"),
                key:
                    parts.find(
                        (k) => !["ctrl", "shift", "alt", "meta"].includes(k)
                    ) ?? "",
            }))
    );

    // Stats
    const handlerFn = useStableCallback(handler);

    // Side effects
    useEffect(() => {
        if (IS_SSR) return;

        const listener = (e: KeyboardEvent) => {
            for (const sc of shortcuts.current) {
                const isMatch =
                    e.ctrlKey === sc.ctrl &&
                    e.shiftKey === sc.shift &&
                    e.altKey === sc.alt &&
                    e.metaKey === sc.meta &&
                    e.key.toLowerCase() === sc.key;

                if (isMatch) {
                    if (prevent) e.preventDefault();
                    if (stop) e.stopPropagation();
                    handlerFn(e);
                    break;
                }
            }
        };

        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [handlerFn, prevent, stop]);
}
