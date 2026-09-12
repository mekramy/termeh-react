"use client";

import { motion } from "motion/react";
import {
    useMemo,
    useRef,
    useSyncExternalStore,
    type HTMLAttributes,
    type PropsWithChildren,
} from "react";
import { useScrollState } from "../../hooks";
import { classNames, newId } from "../../utils";
import { ModalContext, ProviderContext } from "../internal/context";
import { getDefaults } from "../internal/defaults";
import { createModalStore } from "../internal/store";
import type { Animations, Provider, ProviderOptions, Stage } from "../types";

type ModalProviderProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    options?: Partial<ProviderOptions>;
};

export function ModalProvider({
    children,
    className,
    options,
    ...props
}: ModalProviderProps) {
    // Store
    const store = useMemo(() => createModalStore(), []);
    const { isMobile, modals } = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getSnapshot
    );

    const items = Array.from(modals.values());
    const count = items.length;

    // Stats
    const id = useMemo(() => `${newId(32)}`, []);
    const element = useRef<HTMLDivElement>(null);
    const { canScrollUp, canScrollDown } = useScrollState(element.current);
    const context = useMemo<Provider>(
        () => ({
            isMobile,
            id,
            options: options ?? {},
            modalCount: count,
            dimmerEl: element.current ?? null,
            canScrollUp,
            canScrollDown,

            add: store.add,
            refuse: store.refuse,
            close: store.close,
            remove: store.remove,
        }),
        [
            count,
            isMobile,
            id,
            options,
            element,
            canScrollUp,
            canScrollDown,
            store,
        ]
    );
    const defaults = useMemo(() => getDefaults(), []);

    // Derived state
    const variants = useMemo<Omit<Animations, "sheet">>(
        () => ({
            idle: {},

            enter: options?.animations?.enter ?? defaults.animations.enter,
            leave: options?.animations?.leave ?? defaults.animations.leave,
            refuse: options?.animations?.refuse ?? defaults.animations.refuse,

            active: options?.animations?.active ?? defaults.animations.active,
            secondary:
                options?.animations?.secondary ?? defaults.animations.secondary,
            tertiary:
                options?.animations?.tertiary ?? defaults.animations.tertiary,
            hidden: options?.animations?.hidden ?? defaults.animations.hidden,
        }),
        [
            defaults,
            options?.animations?.enter,
            options?.animations?.leave,
            options?.animations?.refuse,
            options?.animations?.active,
            options?.animations?.secondary,
            options?.animations?.tertiary,
            options?.animations?.hidden,
        ]
    );

    const resolveVariant = (stage: Stage): Stage => {
        if (!isMobile) return stage;
        if (["idle", "leave", "refuse"].includes(stage)) return "idle";
        if (stage === "enter") return count < 2 ? "idle" : "enter";
        return stage;
    };

    // Toggle <html> class
    const rootClass = options?.rootClass ?? defaults.rootClass ?? "";
    if (rootClass) {
        if (count) document.documentElement.classList.add(rootClass);
        else document.documentElement.classList.remove(rootClass);
    }

    return (
        <ProviderContext.Provider value={context}>
            {children}
            <div
                {...props}
                id={id}
                ref={element}
                className={classNames(
                    "tm-dimmer",
                    !count && "is-empty",
                    isMobile && "is-mobile",
                    className
                )}
            >
                <div className="tm-container">
                    {items.map((modal) => (
                        <motion.div
                            key={modal.id}
                            initial="idle"
                            animate={resolveVariant(modal.stage)}
                            variants={variants}
                            className={classNames(
                                "tm-item",
                                `is-${modal.state}`
                            )}
                            onAnimationComplete={(def) =>
                                store.handleAnimationComplete(
                                    modal,
                                    def as Stage
                                )
                            }
                        >
                            <ModalContext.Provider value={modal}>
                                {modal.element}
                            </ModalContext.Provider>
                        </motion.div>
                    ))}
                </div>
            </div>
        </ProviderContext.Provider>
    );
}
