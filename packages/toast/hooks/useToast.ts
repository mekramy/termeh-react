import { useCallback, useContext, useMemo, type ReactElement } from "react";
import { newId } from "../../utils";
import { ProviderContext } from "../internal/context";
import { getDefaults } from "../internal/defaults";
import type { Options } from "../types";

/** Custom hook to show toast notifications. */
export function useToast() {
    const ctx = useContext(ProviderContext);
    if (!ctx) {
        throw new Error("useToast must be used inside <ToastProvider />");
    }

    const globalOptions = ctx.getOptions();
    const defaultOptions = useMemo(
        () => getDefaults(globalOptions.direction ?? "ltr"),
        [globalOptions.direction]
    );

    /** Display simple toast (automatically disappear after a certain duration). */
    const notify = useCallback(
        (component: ReactElement, options: Partial<Options> = {}) => {
            const id = newId(24);
            const duration =
                options.duration ??
                globalOptions.duration ??
                defaultOptions.duration;
            const closable =
                options.closable ??
                globalOptions.closable ??
                defaultOptions.closable;
            const onOpen = options.onOpen;
            const onClose = options.onClose;
            const onClick = options.onClick;
            const onAction = options.onAction;

            ctx.add({
                id,
                mode: "default",
                state: "idle",
                stage: "idle",
                options: {
                    duration,
                    closable,
                    onOpen,
                    onClose,
                    onClick,
                    onAction,
                },
                element: component,
                closeMode: null,
            });
        },
        [
            ctx,
            globalOptions.closable,
            globalOptions.duration,
            defaultOptions.closable,
            defaultOptions.duration,
        ]
    );

    /** Display sticky toast (only closed with user action). */
    const sticky = useCallback(
        (component: ReactElement, options: Partial<Options> = {}) => {
            const id = newId(24);
            const onOpen = options.onOpen;
            const onClose = options.onClose;
            const onClick = options.onClick;
            const onAction = options.onAction;

            ctx.add({
                id,
                mode: "sticky",
                state: "idle",
                stage: "idle",
                options: {
                    duration: 0,
                    closable: false,
                    onOpen,
                    onClose,
                    onClick,
                    onAction,
                },
                element: component,
                closeMode: null,
            });
        },
        [ctx]
    );

    return { notify, sticky };
}
