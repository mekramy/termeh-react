import type { Toast } from "../toast";
import type { Callback, CloseMode, Stage, State, Store } from "../types";

/**
 * Factory function to create a toast store, which manages the state of toasts
 * and provides methods for interacting with them.
 */
export function createToastStore(): Store {
    // States
    let stacked: boolean = true;
    let items = new Map<string, Toast>();
    const subscribers = new Set<Callback>();
    let snapshot = { isStacked: stacked, toasts: items };

    // Helpers
    const scheduleRemove = (id: string, closeMode: CloseMode) => {
        const toast = items.get(id);
        if (!toast || toast.isLeaving) return;

        const next = new Map(items);
        if (toast.isHidden) {
            next.delete(id);
            items = normalize(next);
            snapshot = { isStacked: stacked, toasts: items };
            notify();

            toast.options.onClose?.(closeMode);
        } else {
            next.set(
                id,
                toast.clone({
                    stage: stacked ? "leaveStack" : "leave",
                    closeMode,
                })
            );
            items = next;
            snapshot = { isStacked: stacked, toasts: items };
            notify();
        }
    };
    const normalize = (base: Map<string, Toast>) => {
        const entries = Array.from(base.entries());
        const count = entries.length;
        const next = new Map(base);

        entries.forEach(([id, toast], index) => {
            if (toast.isLeaving) return;

            let state: State;
            if (stacked) {
                if (index === count - 1) state = "active";
                else if (index === count - 2) state = "secondary";
                else if (index === count - 3) state = "tertiary";
                else state = "hidden";
            } else {
                state = "active";
            }

            let stage: Stage;
            if (stacked) {
                if (index === count - 1)
                    stage = toast.isIdle ? "enterStack" : "active";
                else if (index === count - 2) stage = "secondary";
                else if (index === count - 3) stage = "tertiary";
                else stage = "hidden";
            } else {
                if (toast.stage === "idle") stage = "enter";
                else stage = "active";
            }

            if (toast.state !== state || toast.stage !== stage) {
                next.set(id, toast.clone({ state, stage }));
            }
        });

        return next;
    };

    // Subscribes
    const getSnapshot = () => snapshot;
    const subscribe = (fn: Callback) => {
        subscribers.add(fn);

        return () => subscribers.delete(fn);
    };
    const notify = () => subscribers.forEach((fn) => fn());

    // Store API
    const setStacked = (value: boolean) => {
        if (stacked === value) return;

        stacked = value;
        items = normalize(items);
        snapshot = { isStacked: stacked, toasts: items };
        notify();
    };

    const add = (toast: Toast) => {
        if (items.has(toast.id)) return;

        const next = new Map(items);
        next.set(toast.id, toast);
        items = normalize(next);
        snapshot = { isStacked: stacked, toasts: items };
        notify();
    };

    const close = (id: string, mode: CloseMode) => {
        scheduleRemove(id, mode);
    };

    const remove = (id: string) => {
        const toast = items.get(id);
        if (!toast) return;

        const next = new Map(items);
        next.delete(id);
        items = normalize(next);
        snapshot = { isStacked: stacked, toasts: items };
        notify();

        toast.options.onClose?.(toast.closeMode ?? "manual");
    };

    const clear = () => {
        Array.from(items.entries())
            .filter(([_, toast]) => toast.mode !== "sticky" && !toast.isLeaving)
            .forEach(([id, _], index) => {
                setTimeout(() => {
                    scheduleRemove(id, "manual");
                }, 75 * index);
            });
    };

    return {
        getSnapshot,
        subscribe,
        setStacked,
        add,
        close,
        remove,
        clear,
    };
}
