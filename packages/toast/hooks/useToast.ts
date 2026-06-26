import { useCallback, useContext, useMemo, type ReactElement } from "react";
import { ProviderContext } from "../internal/context";
import { getDefaults } from "../internal/defaults";
import { Toast } from "../toast";
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

            ctx.add(
                Toast.new({
                    mode: "default",
                    options: {
                        duration,
                        closable,
                        onOpen,
                        onClose,
                        onClick,
                        onAction,
                    },
                    element: component,
                })
            );
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
            const onOpen = options.onOpen;
            const onClose = options.onClose;
            const onClick = options.onClick;
            const onAction = options.onAction;

            ctx.add(
                Toast.new({
                    mode: "sticky",
                    options: {
                        duration: 0,
                        closable: false,
                        onOpen,
                        onClose,
                        onClick,
                        onAction,
                    },
                    element: component,
                })
            );
        },
        [ctx]
    );

    return { notify, sticky };
}
