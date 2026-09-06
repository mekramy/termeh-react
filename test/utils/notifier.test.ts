import { describe, expect, it, vi } from "vitest";
import { createNotifier } from "../../packages/utils/notifier";

describe("createNotifier", () => {
    it("notifies subscribers with the provided arguments", () => {
        const notifier = createNotifier<[number, string]>();
        const subscriber = vi.fn();

        notifier.subscribe(subscriber);
        notifier.notify(10, "test");

        expect(subscriber).toHaveBeenCalledExactlyOnceWith(10, "test");
    });

    it("does not notify the same subscriber more than once", () => {
        const notifier = createNotifier<[number]>();
        const subscriber = vi.fn();

        notifier.subscribe(subscriber);
        notifier.subscribe(subscriber);
        notifier.notify(10);

        expect(subscriber).toHaveBeenCalledExactlyOnceWith(10);
    });

    it("supports idempotent unsubscribe and clearing subscribers", () => {
        const notifier = createNotifier<[number]>();
        const subscriber = vi.fn();
        const unsubscribe = notifier.subscribe(subscriber);

        unsubscribe();
        unsubscribe();
        notifier.notify(1);
        expect(subscriber).not.toHaveBeenCalled();

        notifier.subscribe(subscriber);
        notifier.clear();
        notifier.notify(2);
        expect(subscriber).not.toHaveBeenCalled();
    });

    it("uses a subscriber snapshot while notifying", () => {
        const notifier = createNotifier<[]>();
        const secondSubscriber = vi.fn();
        const firstSubscriber = vi.fn(() => {
            notifier.subscribe(secondSubscriber);
        });

        notifier.subscribe(firstSubscriber);
        notifier.notify();

        expect(firstSubscriber).toHaveBeenCalledOnce();
        expect(secondSubscriber).not.toHaveBeenCalled();

        notifier.notify();
        expect(secondSubscriber).toHaveBeenCalledOnce();
    });
});
