import { useCallback, useState } from "react";
import {
    useBottomSheet,
    useIsMounted,
    useRefCallback,
    useRem,
    useScrollState,
    useStableCallback,
    useTouchAction,
    useVisualViewport,
    useWatch,
} from "../../hooks";
import { classNames } from "../../utils";
import { useModalContext, useProviderContext } from "../internal/context";
import type { ClickArea, CloseMode } from "../types";

/** Custom hook to create custom modal. */
export function useCreate<T extends HTMLElement>(scroller?: T) {
    const rem = useRem();

    // Read contexts
    const context = useProviderContext("useCreate");
    const modal = useModalContext("useCreate");
    const isSheet = context.isMobile;
    const isModal = !context.isMobile;
    const stackGap = context.options.stackGap ?? 8;

    // Lifecycle
    const isMounted = useIsMounted(() => modal.options.onOpen?.());

    // Stats
    const [loading, setLoading] = useState(false);
    const isAlive = !modal.isIdle && !modal.isLeaving;
    const className = classNames(
        `is-${modal.state}`,
        loading && "is-loading",
        modal.isClosable && "is-closable",
        modal.isClickable && "is-clickable"
    );

    // Attach click handler
    const [ref, element] = useRefCallback<HTMLDivElement>((el) => {
        const handler = (e: MouseEvent) => {
            const dimmer = context.dimmerEl;
            const target = e.target as HTMLElement;

            if (el.contains(target)) {
                handleClick("modal");
            } else if (dimmer?.contains(target)) {
                handleClick("dimmer");
            }
        };

        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    });

    // Bottom Sheet
    const viewport = useVisualViewport();
    const scrollState = useScrollState(scroller ?? element, {
        threshold: rem,
    });
    const touchAction = useTouchAction(scrollState, {
        axis: "y",
        fallback: "none",
    });
    const gap = Math.min(context.modalCount, 3) * stackGap + stackGap;
    const {
        stage,
        y,
        height,
        onPan,
        onPanStart,
        onPanEnd,
        close: closeSheet,
    } = useBottomSheet({
        viewport,
        gap,
        expandable: true,
        closable: modal.options.closable,
        fastClose: true,
        enterAnimation: isSheet && context.modalCount < 2,
        disabled: isModal,
        onClose: () => context.remove(modal.id),
    });
    const motionStyles = isSheet
        ? {
              y,
              maxHeight: height,
              touchAction,
          }
        : undefined;
    const motionListeners =
        isSheet && !loading && modal.state === "active"
            ? {
                  onPan,
                  onPanStart,
                  onPanEnd,
              }
            : undefined;

    // Helpers
    const scheduleClose = useStableCallback((mode: CloseMode) => {
        if (isSheet) closeSheet();
        context.close(modal.id, mode);
    });

    const handleClick = useStableCallback((target: ClickArea) => {
        if (loading || !modal.isActive) return;
        const mode = target === "modal" ? "click" : "dimmer";

        if (typeof modal.options.onClick === "function") {
            setLoading(true);
            modal.options
                .onClick(target)
                .then((result) => {
                    setLoading(false);
                    if (result) scheduleClose("click");
                    else if (target === "dimmer" && isModal)
                        context.refuse(modal.id);
                })
                .catch(() => setLoading(false));
        } else if (target === "dimmer") {
            if (modal.options.closable) scheduleClose(mode);
            else if (isModal) context.refuse(modal.id);
        }
    });

    // APIs
    const close = useCallback(() => {
        if (loading || !isAlive) return;
        scheduleClose("manual");
    }, [loading, isAlive, scheduleClose]);

    const action = useCallback(
        (key: string, data?: unknown) => {
            if (
                loading ||
                !isAlive ||
                typeof modal.options.onAction !== "function"
            )
                return;

            setLoading(true);
            modal.options
                .onAction(key, data)
                .then((result) => {
                    setLoading(false);
                    if (result) scheduleClose("action");
                })
                .catch(() => setLoading(false));
        },
        [isAlive, loading, scheduleClose, modal.options]
    );

    // Watch sheet close
    useWatch(stage, (s) => {
        if (s === "closing") scheduleClose("swipe");
    });

    return {
        ref,
        element,
        isMounted,

        isSheet,
        isModal,
        isAlive,
        canScrollUp: isSheet ? scrollState.canScrollUp : context.canScrollUp,
        canScrollDown: isSheet
            ? scrollState.canScrollDown
            : context.canScrollDown,

        close,
        action,
        loading,
        className,
        touchAction,
        motionStyles,
        motionListeners,

        id: modal.id,
        state: modal.state,
        isClosable: modal.isClosable,
        isClickable: modal.isClickable,
    };
}
