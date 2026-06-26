import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useEvent, useRefCallback } from "../../hooks";
import { classNames } from "../../utils";
import { ProviderContext, ToastContext } from "../internal/context";
import type { CloseMode } from "../types";

/** Custom hook to create custom toast notifications. */
export function useCreate() {
    // Read stores
    const ctx = useContext(ProviderContext);
    const toast = useContext(ToastContext);
    if (!toast || !ctx) {
        throw new Error("useCreate must be used inside <ToastProvider />");
    }

    // States
    const intervalRef = useRef(0);
    const [paused, setPaused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Computed
    const isAlive = !["idle", "leave", "leaveStack"].includes(toast.state);

    // Handlers
    const scheduleClose = useEvent((mode: CloseMode) => {
        ctx.close(toast.id, mode);

        if (typeof window !== "undefined")
            window.clearInterval(intervalRef.current);
    });

    const onTick = useEvent(() => {
        if (progress >= 100) {
            scheduleClose("timer");
        } else if (!loading && !paused && isAlive) {
            setProgress(
                Math.min(100, progress + 100 / (toast.options.duration * 100))
            );
        }
    });

    const onClick = useEvent(() => {
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
        } else if (toast.options.closable) {
            scheduleClose("click");
        }
    });

    const onMouseEnter = useEvent(() => {
        if (isAlive && toast.mode !== "sticky") setPaused(true);
    });

    const onMouseLeave = useEvent(() => {
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
        if (
            typeof window !== "undefined" &&
            toast.mode !== "sticky" &&
            toast.options.duration &&
            toast.options.duration > 0
        ) {
            intervalRef.current = setInterval(onTick, 10);
        }

        return () => {
            if (typeof window !== "undefined")
                clearInterval(intervalRef.current);
        };
    });

    // APIs
    const close = useCallback(() => {
        if (loading || !isAlive) return;

        scheduleClose("manual");
    }, [loading, isAlive, scheduleClose]);

    const pause = useCallback(() => {
        if (isAlive && toast.mode !== "sticky") setPaused(true);
    }, [isAlive, toast.mode]);

    const resume = useCallback(() => {
        if (isAlive && toast.mode !== "sticky") setPaused(false);
    }, [isAlive, toast.mode]);

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
            duration: toast.options.duration,
            closable: toast.options.closable,
            isSticky: toast.mode === "sticky",
            isClosable:
                toast.mode !== "sticky" &&
                toast.options.duration &&
                toast.options.duration > 0,
            stateClasses: classNames(
                `is-${toast.state}`,
                toast.mode === "sticky" && "is-sticky",
                toast.mode !== "sticky" &&
                    toast.options.duration &&
                    toast.options.duration > 0 &&
                    "is-closable",
                paused && "is-paused",
                loading && "is-loading"
            ),
            paused,
            loading,
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
            toast.options.duration,
            toast.options.closable,
            paused,
            loading,
            progress,
            close,
            pause,
            resume,
            action,
        ]
    );
}
