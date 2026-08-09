import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useRefCallback, useStableCallback } from "../../hooks";
import { classNames, IS_CLIENT, IS_SSR } from "../../utils";
import { ProviderContext, ToastContext } from "../internal/context";
import type { CloseMode } from "../types";

/** Custom hook to create custom toast notifications. */
export function useCreate() {
    // Read stores
    const ctx = useContext(ProviderContext);
    const toast = useContext(ToastContext);
    if (!ctx || !toast) {
        throw new Error("useCreate must be used inside <ToastProvider />");
    }

    // States
    const intervalRef = useRef(0);
    const [paused, setPaused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Computed
    const isAlive = !toast.isIdle && !toast.isLeaving;
    const stateClasses = classNames(
        `is-${toast.state}`,
        paused && "is-paused",
        loading && "is-loading",
        toast.isSticky && "is-sticky",
        toast.isClosable && "is-closable",
        toast.isClickable && "is-clickable",
        toast.isAutoClosing && "is-auto-closing"
    );

    // Handlers
    const scheduleClose = useStableCallback((mode: CloseMode) => {
        ctx.close(toast.id, mode);

        if (IS_CLIENT) window.clearInterval(intervalRef.current);
    });

    const onTick = useStableCallback(() => {
        if (progress >= 100) {
            scheduleClose("timer");
        } else if (!loading && !paused && isAlive) {
            setProgress(
                Math.min(100, progress + 100 / (toast.options.duration * 100))
            );
        }
    });

    const onClick = useStableCallback(() => {
        if (loading || !isAlive) return;

        if (typeof toast.options.onClick === "function") {
            setLoading(true);
            toast.options
                .onClick()
                .then((result) => {
                    setLoading(false);
                    if (result) scheduleClose("click");
                })
                .catch(() => setLoading(false));
        }
    });

    const onMouseEnter = useStableCallback(() => {
        if (isAlive && toast.mode !== "sticky") setPaused(true);
    });

    const onMouseLeave = useStableCallback(() => {
        if (isAlive && toast.mode !== "sticky") setPaused(false);
    });

    // handle callback
    const [ref] = useRefCallback<HTMLElement>((el) => {
        el.addEventListener("click", onClick);
        el.addEventListener("mouseenter", onMouseEnter);
        el.addEventListener("mouseleave", onMouseLeave);

        return () => {
            el.removeEventListener("click", onClick);
            el.removeEventListener("mouseenter", onMouseEnter);
            el.removeEventListener("mouseleave", onMouseLeave);
        };
    });

    // Lifecycle
    useEffect(() => {
        if (IS_SSR) return;

        if (toast.isAutoClosing) {
            intervalRef.current = setInterval(onTick, 10);
        }

        return () => {
            clearInterval(intervalRef.current);
        };
    });

    // APIs
    const close = useCallback(() => {
        if (loading || !isAlive) return;

        scheduleClose("manual");
    }, [loading, isAlive, scheduleClose]);

    const pause = useCallback(() => {
        if (isAlive && toast.isAutoClosing) setPaused(true);
    }, [isAlive, toast.isAutoClosing]);

    const resume = useCallback(() => {
        if (isAlive && toast.isAutoClosing) setPaused(false);
    }, [isAlive, toast.isAutoClosing]);

    const action = useCallback(
        (key: string, data?: unknown) => {
            if (
                loading ||
                !isAlive ||
                typeof toast.options.onAction !== "function"
            )
                return;

            setLoading(true);
            toast.options
                .onAction(key, data)
                .then((result) => {
                    setLoading(false);
                    if (result) scheduleClose("action");
                })
                .catch(() => setLoading(false));
        },
        [isAlive, loading, scheduleClose, toast.options]
    );

    return useMemo(
        () => ({
            ref,
            id: toast.id,
            mode: toast.mode,
            state: toast.state,
            isSticky: toast.isSticky,
            isClosable: toast.isClosable,
            isClickable: toast.isClickable,
            isAutoClosing: toast.isAutoClosing,
            isPaused: paused,
            isLoading: loading,
            stateClasses,
            progress,
            close,
            pause,
            resume,
            action,
        }),
        [
            ref,
            toast.id,
            toast.mode,
            toast.state,
            toast.isSticky,
            toast.isClosable,
            toast.isClickable,
            toast.isAutoClosing,
            paused,
            loading,
            stateClasses,
            progress,
            close,
            pause,
            resume,
            action,
        ]
    );
}
