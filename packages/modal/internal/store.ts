"use client";

import type { Modal } from "../modal";
import type { Callback, CloseMode, Stage, State, Store } from "../types";

/**
 * Factory function to create a modal store, which manages the state of modals
 * and provides methods for interacting with them.
 */
export function createModalStore(): Store {
    // Mobile device detection using a media query.
    const mql = window.matchMedia("screen and (max-width: 768px)");
    let isMobile: boolean = mql.matches;
    mql.addEventListener("change", (e) => {
        isMobile = e.matches;
        snapshot = { isMobile, modals };
        notify();
    });

    // States
    let modals = new Map<string, Modal>();
    let snapshot = { isMobile, modals };
    const subscribers = new Set<Callback>();

    // Helpers
    function scheduleRemove(id: string, closeMode: CloseMode) {
        const modal = modals.get(id);
        if (!modal || modal.isLeaving) return;

        const next = new Map(modals);
        if (modal.isHidden) {
            next.delete(id);
            modals = normalize(next);
            snapshot = { isMobile, modals };
            notify();

            modal.options.onClose?.(closeMode);
        } else {
            next.set(
                id,
                modal.clone({
                    closeMode,
                    stage: "leave",
                })
            );
            modals = next;
            modals = normalize(next);
            snapshot = { isMobile, modals };
            notify();
        }
    }

    function normalize(base: Map<string, Modal>) {
        const entries = Array.from(base.entries());

        const stackEntries = entries.filter(([, modal]) => !modal.isLeaving);

        const count = entries.length;
        const stackCount = stackEntries.length;

        const next = new Map(base);

        entries.forEach(([id, modal], index) => {
            // State is always based on real list position.
            const state: State =
                index === count - 1
                    ? "active"
                    : index === count - 2
                      ? "secondary"
                      : index === count - 3
                        ? "tertiary"
                        : "hidden";

            let stage: Stage;

            if (modal.isLeaving) {
                stage = "leave";
            } else {
                const stackIndex = stackEntries.findIndex(
                    ([stackId]) => stackId === id
                );

                if (stackIndex === stackCount - 1) {
                    stage = modal.isIdle
                        ? "enter"
                        : modal.isRefusing
                          ? modal.stage
                          : "active";
                } else if (stackIndex === stackCount - 2) {
                    stage = "secondary";
                } else if (stackIndex === stackCount - 3) {
                    stage = "tertiary";
                } else {
                    stage = "hidden";
                }
            }

            if (modal.state !== state || modal.stage !== stage) {
                next.set(id, modal.clone({ state, stage }));
            }
        });

        return next;
    }

    const activate = (id: string) => {
        const modal = modals.get(id);
        if (!modal?.isRefusing) return;

        const next = new Map(modals);
        next.set(id, modal.clone({ stage: "active" }));
        modals = normalize(next);
        snapshot = { isMobile, modals };
        notify();
    };

    // Subscribes
    const getSnapshot = () => snapshot;

    const subscribe = (fn: Callback) => {
        subscribers.add(fn);

        return () => subscribers.delete(fn);
    };

    const notify = () => subscribers.forEach((fn) => fn());

    // Store API
    const add = (modal: Modal) => {
        if (modals.has(modal.id)) return;

        const next = new Map(modals);
        next.set(modal.id, modal);
        modals = normalize(next);
        snapshot = { isMobile, modals };
        notify();
    };

    const refuse = (id: string) => {
        const modal = modals.get(id);
        if (isMobile || !modal || modal.isRefusing || !modal.isActive) return;

        const next = new Map(modals);
        next.set(id, modal.clone({ stage: "refuse" }));
        modals = normalize(next);
        snapshot = { isMobile, modals };
        notify();
    };

    const close = (id: string, mode: CloseMode) => {
        scheduleRemove(id, mode);
    };

    const remove = (id: string) => {
        const modal = modals.get(id);
        if (!modal) return;

        const next = new Map(modals);
        next.delete(id);
        modals = normalize(next);
        snapshot = { isMobile, modals };
        notify();

        modal.options.onClose?.(modal.closeMode ?? "manual");
    };

    const handleAnimationComplete = (modal: Modal, animation: Stage) => {
        if (animation === "leave") remove(modal.id);
        else if (animation === "refuse") activate(modal.id);
    };

    return {
        getSnapshot,
        subscribe,
        add,
        refuse,
        close,
        remove,
        handleAnimationComplete,
    };
}
