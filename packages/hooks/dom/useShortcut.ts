import { IS_SSR } from "../../utils";
import { useIsomorphicLayoutEffect } from "../react";
import { useDeepMemoize } from "../react/useDeepMemoize";
import { useStableCallback } from "../react/useStableCallback";

interface UseShortcutOptions {
    /**
     * Timeout for completing the shortcut sequence, in milliseconds.
     *
     * @default 1000
     */
    timeout?: number;
    /**
     * Whether to stop the event from bubbling.
     *
     * @default true
     */
    stop?: boolean;
    /**
     * Whether to prevent the browser's default action for the shortcut.
     *
     * @default true
     */
    prevent?: boolean;
}

/**
 * Registers a global keyboard shortcut.
 *
 * Listens to `keydown` events and calls `handler` with the original
 * `KeyboardEvent` when the shortcut sequence matches.
 *
 * @param shortcut - Shortcut sequence to match, such as `ctrl+shift+k` or
 *   `cmd+s`.
 * @param handler - Called when the shortcut is triggered.
 * @param options - Shortcut behavior options.
 */
export function useShortcut(
    shortcut: string,
    handler: (e: KeyboardEvent) => void,
    { timeout = 1000, stop = true, prevent = true }: UseShortcutOptions = {}
) {
    const stableHandler = useStableCallback(handler);
    const shortcuts = useDeepMemoize(
        shortcut
            .toLowerCase()
            .split("+")
            .map((s) => (["ctrl", "meta", "cmd"].includes(s) ? "cmd" : s))
            .filter(Boolean)
    );

    useIsomorphicLayoutEffect(() => {
        if (IS_SSR) return;

        let buffer: string[] = [];
        let timer: number | undefined;
        const nonModifiers = shortcuts.filter((k) => !isModifier(k));

        const clear = () => {
            buffer = [];

            if (timer) {
                clearTimeout(timer);
                timer = undefined;
            }
        };

        const restart = () => {
            if (timer) clearTimeout(timer);

            timer = window.setTimeout(() => {
                clear();
            }, timeout);
        };

        const onKeydown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            if (isModifier(key)) {
                restart();
                return;
            }

            buffer.push(key);

            const modifierMatches = shortcuts.every((k) => {
                if (k === "cmd") return e.ctrlKey || e.metaKey;
                if (k === "shift") return e.shiftKey;
                if (k === "alt") return e.altKey;
                return true;
            });

            const keyMatches =
                buffer.length === nonModifiers.length &&
                nonModifiers.every((k, i) => buffer[i] === k);

            if (modifierMatches && keyMatches) {
                if (stop) e.stopPropagation();
                if (prevent) e.preventDefault();
                stableHandler(e);
                clear();
                return;
            }

            if (
                buffer.length > nonModifiers.length ||
                !nonModifiers
                    .slice(0, buffer.length)
                    .every((k, i) => buffer[i] === k)
            ) {
                clear();
                return;
            }

            restart();
        };

        window.addEventListener("keydown", onKeydown);

        return () => {
            clear();
            window.removeEventListener("keydown", onKeydown);
        };
    }, [stableHandler, shortcuts, timeout, stop, prevent]);
}

function isModifier(key: string) {
    return [
        "control",
        "ctrl",
        "meta",
        "cmd",
        "shift",
        "alt",
        "altgraph",
    ].includes(key);
}
