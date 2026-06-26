import { motion } from "motion/react";
import {
    useCallback,
    useEffect,
    useMemo,
    useSyncExternalStore,
    type HTMLAttributes,
    type PropsWithChildren,
    type ReactNode,
} from "react";
import { useHasFinePointer } from "../../mq";
import { classNames } from "../../utils";
import { CloseIcon } from "../internal/CloseIcon";
import { ProviderContext, ToastContext } from "../internal/context";
import { getDefaults } from "../internal/defaults";
import { createToastStore } from "../internal/store";
import type { Toast } from "../toast";
import type { Animations, Provider, ProviderOptions, Stage } from "../types";

type ToastProviderProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    closeIcon?: ReactNode;
    clearText?: string;
    collapseText?: string;
    options?: Partial<ProviderOptions>;
};

export function ToastProvider({
    children,
    className,
    clearText,
    closeIcon,
    options,
    ...props
}: ToastProviderProps) {
    // Stats
    const store = useMemo(() => createToastStore(), []);
    const { isStacked, toasts } = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getSnapshot
    );
    const context = useMemo<Provider>(
        () => ({
            add: store.add,
            close: store.close,
            remove: store.remove,
            clear: store.clear,
            getOptions: () => options ?? {},
        }),
        [store, options]
    );
    const defaults = useMemo(
        () => getDefaults(options?.direction ?? "ltr"),
        [options?.direction]
    );
    const isHoverable = useHasFinePointer();

    // Computed
    const items = Array.from(toasts.values());
    const count = items.length;
    const bodyClass = options?.bodyClass ?? defaults.bodyClass ?? "";
    const actionBarAnimate = !isStacked && count ? "show" : "hide";
    const actionBarVariants = useMemo(
        () => ({
            show:
                options?.actionBarAnimations?.show ??
                defaults.actionBarAnimations?.show ??
                {},
            hide:
                options?.actionBarAnimations?.hide ??
                defaults.actionBarAnimations?.hide ??
                {},
        }),
        [
            defaults,
            options?.actionBarAnimations?.show,
            options?.actionBarAnimations?.hide,
        ]
    );
    const toastVariants = useMemo<Animations>(
        () => ({
            idle: options?.animations?.idle ??
                defaults.animations?.idle ?? { opacity: 0 },

            enter: options?.animations?.enter ??
                defaults.animations?.enter ?? { opacity: 1 },
            enterStack: options?.animations?.enterStack ??
                defaults.animations?.enterStack ?? { opacity: 1 },
            leave: options?.animations?.leave ??
                defaults.animations?.leave ?? { opacity: 0 },
            leaveStack: options?.animations?.leaveStack ??
                defaults.animations?.leaveStack ?? { opacity: 0 },

            active: options?.animations?.active ??
                defaults.animations?.active ?? { opacity: 1, scale: 1 },
            secondary: options?.animations?.secondary ??
                defaults.animations?.secondary ?? {
                    opacity: 1,
                    scale: 0.95,
                    y: -10,
                },
            tertiary: options?.animations?.tertiary ??
                defaults.animations?.tertiary ?? {
                    opacity: 1,
                    scale: 0.9,
                    y: -20,
                },
            hidden: options?.animations?.hidden ??
                defaults.animations?.hidden ?? { opacity: 0 },
        }),
        [
            defaults,
            options?.animations?.idle,
            options?.animations?.enter,
            options?.animations?.enterStack,
            options?.animations?.leave,
            options?.animations?.leaveStack,
            options?.animations?.active,
            options?.animations?.secondary,
            options?.animations?.tertiary,
            options?.animations?.hidden,
        ]
    );

    // Toggle body class
    if (bodyClass && typeof document !== "undefined") {
        if (count) {
            document.body.classList.add(bodyClass);
        } else {
            document.body.classList.remove(bodyClass);
        }
    }

    // Handlers
    const onAnimationComplete = useCallback(
        (toast: Toast, animation: Stage) => {
            if (animation === "leave" || animation === "leaveStack") {
                store.remove(toast.id);
            }
        },
        [store]
    );

    const onHover = useCallback(() => {
        if (isHoverable) store.setStacked(false);
    }, [isHoverable, store]);

    const onLeave = useCallback(() => {
        if (isHoverable) store.setStacked(true);
    }, [isHoverable, store]);

    // Close on mobile
    useEffect(() => {
        if (!count && !isStacked) {
            store.setStacked(true);
        }
    }, [count, isStacked, store]);

    return (
        <ProviderContext.Provider value={context}>
            {children}
            <div
                {...props}
                className={classNames(
                    "tt-dimmer",
                    !count && "is-empty",
                    isStacked && "is-stacked",
                    className
                )}
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
            >
                <motion.div
                    initial="hide"
                    animate={actionBarAnimate}
                    variants={actionBarVariants}
                    className="tt-actions"
                >
                    <div className="actions-wrapper">
                        <div className="action" onClick={store.clear}>
                            {clearText ?? "Clear"}
                        </div>
                        <div
                            className="icon-action"
                            onClick={() => store.setStacked(!isStacked)}
                        >
                            <div className="icon">
                                {closeIcon ?? <CloseIcon />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="tt-container">
                    {items.map((t) => (
                        <motion.div
                            key={t.id}
                            layout="position"
                            transition={{ layout: { duration: 0.3 } }}
                            className={classNames("tt-item", `is-${t.state}`)}
                        >
                            <motion.div
                                initial="idle"
                                animate={t.stage}
                                variants={toastVariants}
                                onAnimationComplete={(def) =>
                                    onAnimationComplete(t, def as Stage)
                                }
                                className="tt-item-wrapper"
                            >
                                <ToastContext.Provider value={t}>
                                    {t.element}
                                </ToastContext.Provider>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <div
                    className="tt-collapser"
                    onClick={() => store.setStacked(false)}
                />
            </div>
        </ProviderContext.Provider>
    );
}
