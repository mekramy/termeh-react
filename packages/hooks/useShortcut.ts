import { useEffect, useRef } from "react";

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
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    // Side effects
    useEffect(() => {
        if (typeof window === "undefined") return;

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
                    handlerRef.current(e);
                    break;
                }
            }
        };

        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, [prevent, stop]);
}
