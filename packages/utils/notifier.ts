/** A callback that receives a tuple of arguments. */
export type Subscriber<Args extends readonly unknown[]> = (
    ...args: Args
) => void;

/**
 * A utility for subscribing to and notifying multiple callbacks.
 *
 * @typeParam Args - The tuple of arguments passed to subscribers.
 */
export interface Notifier<Args extends readonly unknown[]> {
    /**
     * Subscribes a callback and returns an idempotent unsubscribe function.
     *
     * @param subscriber - The callback to invoke on notification.
     * @returns A function that removes the subscriber.
     */
    subscribe(subscriber: Subscriber<Args>): () => void;

    /**
     * Notifies all currently subscribed callbacks.
     *
     * @param args - The arguments passed to each subscriber.
     */
    notify(...args: Args): void;

    /** Removes all subscribers. */
    clear(): void;
}

/**
 * Creates a notifier for a tuple of arguments.
 *
 * Subscribers are stored in a Set, so registering the same callback more than
 * once does not create duplicate notifications.
 *
 * Each notification uses a snapshot of the subscribers. Changes made to
 * subscriptions during notification affect subsequent notifications only.
 *
 * @example
 *     ```ts
 *     const notifier = createNotifier<[number, string]>();
 *
 *     const unsubscribe = notifier.subscribe((value, name) => {
 *         console.log(value, name);
 *     });
 *
 *     notifier.notify(10, "test");
 *     unsubscribe();
 *     ```;
 *
 * @typeParam Args - The tuple of arguments passed to subscribers.
 */
export function createNotifier<
    Args extends readonly unknown[],
>(): Notifier<Args> {
    const subscribers = new Set<Subscriber<Args>>();

    const subscribe = (subscriber: Subscriber<Args>): (() => void) => {
        subscribers.add(subscriber);

        let subscribed = true;

        return () => {
            if (!subscribed) return;

            subscribed = false;
            subscribers.delete(subscriber);
        };
    };

    const notify = (...args: Args): void => {
        const snapshot = [...subscribers];

        for (const subscriber of snapshot) {
            subscriber(...args);
        }
    };

    const clear = (): void => {
        subscribers.clear();
    };

    return {
        subscribe,
        notify,
        clear,
    };
}
