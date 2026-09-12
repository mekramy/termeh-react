import { useCallback, useContext, useMemo, type ReactElement } from "react";
import { ProviderContext } from "../internal/context";
import { getDefaults } from "../internal/defaults";
import { Modal } from "../modal";
import type { Options } from "../types";

/** Custom hook to show a modal dialog. */
export function useModal() {
    const ctx = useContext(ProviderContext);
    if (!ctx) {
        throw new Error("useModal must be used inside <ModalProvider />");
    }

    const globalOptions = ctx.options;
    const defaultOptions = useMemo(() => getDefaults(), []);

    /** Open modal. */
    const show = useCallback(
        (component: ReactElement, options: Partial<Options> = {}) => {
            const closable =
                options.closable ??
                globalOptions.closable ??
                defaultOptions.closable;
            const onOpen = options.onOpen;
            const onClose = options.onClose;
            const onClick = options.onClick;
            const onAction = options.onAction;

            ctx.add(
                Modal.new({
                    options: {
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
        [ctx, globalOptions.closable, defaultOptions.closable]
    );

    return { show };
}
