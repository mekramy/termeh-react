"use client";

import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingPortal,
    offset,
    safePolygon,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useRole,
    type Middleware,
    type OpenChangeReason,
} from "@floating-ui/react";
import { motion } from "motion/react";
import {
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    useComputed,
    useIsMounted,
    useMemoize,
    useStableCallback,
    useVersionToken,
} from "../../hooks";
import { classNames } from "../../utils";
import { DEFAULT_ANIMATIONS, DEFAULT_HOVER_OPTIONS } from "./default";
import type {
    ClickArea,
    CloseMode,
    Options,
    RenderContentProps,
    RenderSourceProps,
} from "./types";
import {
    resolveAnimation,
    resolveCloseMode,
    resolveOpenMode,
    resolveSide,
} from "./utils";

/**
 * Popup component for displaying floating content.
 *
 * @param options - Configuration options for the popup.
 * @returns The Popup component.
 */
export function Popup<T = unknown>({
    ref,
    initial = "close",
    trigger = "click",
    placement = "bottom",
    closable = true,
    portalId,
    portalNode,
    className,
    animations = DEFAULT_ANIMATIONS,

    role: _role = "tooltip",
    offset: _offset = true,
    flip: _flip = true,
    shift: _shift = true,
    arrow: _arrow = true,

    hoverOptions = DEFAULT_HOVER_OPTIONS,
    clickOptions,
    dismissOptions,

    middleware = [],

    onOpen,
    onClose,
    onClick,
    onAction,

    source,
    content,
    actions,
}: Options<T>) {
    const arrowRef = useRef<SVGSVGElement>(null);

    // Lifecycle
    const isMounted = useIsMounted();
    const { nextVersion, verifyVersion } = useVersionToken();

    // Stats
    const [isOpen, setIsOpen] = useState(initial === "open");
    const [isLoading, setIsLoading] = useState(false);

    // Normalize and memoize
    const triggers = useMemoize(Array.isArray(trigger) ? trigger : [trigger]);
    const isManual = triggers.includes("manual");
    const middlewares = useComputed<Middleware[]>(() => {
        const mw: Middleware[] = [];

        if (_offset !== false) {
            mw.push(
                offset(
                    _offset === true
                        ? _arrow !== false
                            ? 12
                            : undefined
                        : _offset
                )
            );
        } else if (_arrow !== false) {
            mw.push(offset(12));
        }

        if (_flip !== false) {
            mw.push(flip(_flip === true ? undefined : _flip));
        }

        if (_shift !== false) {
            mw.push(shift(_shift === true ? undefined : _shift));
        }

        if (_arrow !== false) {
            mw.push(
                arrow({
                    ...(_arrow === true ? {} : _arrow),
                    element: arrowRef,
                })
            );
        }

        return [...mw, ...middleware];
    }, [_offset, _shift, _arrow, _flip]);

    // Handler / Helpers
    const scheduleClose = useStableCallback((mode: CloseMode) => {
        if (!isOpen) return;

        setIsOpen(false);
        onClose?.(mode);
    });

    const handleClick = useStableCallback((target: ClickArea) => {
        if (isLoading || !isOpen || typeof onClick !== "function") return;

        const version = nextVersion();
        setIsLoading(true);
        onClick(target)
            .then((result) => {
                if (!isMounted() || !verifyVersion(version)) return;

                setIsLoading(false);
                if (result) scheduleClose("click");
            })
            .catch(() => {
                if (!isMounted() || !verifyVersion(version)) return;
                setIsLoading(false);
            });
    });

    const handleOpenChange = useStableCallback(
        (open: boolean, _event?: Event, reason?: OpenChangeReason) => {
            if (open) {
                if (!isOpen) {
                    setIsOpen(true);
                    onOpen?.(resolveOpenMode(reason));
                }

                return;
            }

            if (!closable || isLoading) return;

            if (reason === "outside-press" && typeof onClick === "function") {
                handleClick("outside");
                return;
            }

            scheduleClose(resolveCloseMode(reason));
        }
    );

    // Global  API
    const open = useCallback(() => {
        if (!isOpen) {
            setIsOpen(true);
            onOpen?.("manual");
        }
    }, [isOpen, onOpen]);

    const close = useCallback(() => {
        if (isLoading || !isOpen) return;
        scheduleClose("manual");
    }, [isLoading, isOpen, scheduleClose]);

    const action = useCallback(
        (key: string, data?: T) => {
            if (isLoading || !isOpen || typeof onAction !== "function") return;

            const version = nextVersion();
            setIsLoading(true);
            onAction(key, data)
                .then((result) => {
                    if (!isMounted() || !verifyVersion(version)) return;

                    setIsLoading(false);
                    if (result) scheduleClose("action");
                })
                .catch(() => {
                    if (!isMounted() || !verifyVersion(version)) return;
                    setIsLoading(false);
                });
        },
        [
            isLoading,
            isOpen,
            isMounted,
            nextVersion,
            verifyVersion,
            onAction,
            scheduleClose,
        ]
    );

    // Hook to manage the floating element's positioning and behavior
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        placement,
        middleware: middlewares,
        onOpenChange: handleOpenChange,
        whileElementsMounted: autoUpdate,
    });

    const hover = useHover(context, {
        ...hoverOptions,
        handleClose: safePolygon(),
        enabled: !isManual && !isLoading && triggers.includes("hover"),
    });
    const focus = useFocus(context, {
        enabled: !isManual && !isLoading && triggers.includes("focus"),
    });
    const click = useClick(context, {
        ...clickOptions,
        toggle: false,
        enabled: !isManual && !isLoading && triggers.includes("click"),
    });
    const dismiss = useDismiss(context, {
        ...dismissOptions,
        enabled: !isManual && !isLoading && closable,
    });
    const role = useRole(context, { role: _role });
    const { getReferenceProps, getFloatingProps } = useInteractions([
        hover,
        focus,
        click,
        dismiss,
        role,
    ]);

    // Driven value
    const side = resolveSide(context.placement);
    const variants = resolveAnimation(side, animations);
    const sourceProps: RenderSourceProps = useMemo(
        () => ({
            context,
            side,
            isOpen,
            isLoading,
            open,
            getProps: () =>
                getReferenceProps({
                    ref: refs.setReference,
                }),
        }),
        [context, side, isOpen, isLoading, refs, open, getReferenceProps]
    );
    const contentProps: RenderContentProps<T> = useMemo(
        () => ({
            context,
            side,
            isOpen,
            isLoading,
            close,
            action,
        }),
        [context, side, isOpen, isLoading, close, action]
    );

    // Expose the open and close methods via the ref
    useImperativeHandle(
        ref,
        () => ({
            open,
            close,
        }),
        [open, close]
    );

    // Render UIs
    const sourceUI = source(sourceProps);
    const contentUI = content(contentProps);
    const actionsUI = actions?.(contentProps);

    return (
        <>
            {sourceUI}
            <FloatingPortal id={portalId} root={portalNode}>
                <div
                    ref={refs.setFloating}
                    style={{
                        ...floatingStyles,
                        pointerEvents: isOpen ? "auto" : "none",
                        transition: "transform 0.3s ease-out",
                    }}
                    {...getFloatingProps()}
                >
                    <motion.div
                        initial="close"
                        animate={isOpen ? "open" : "close"}
                        variants={variants}
                        className={classNames(
                            "popup",
                            isLoading && "is-loading",
                            className
                        )}
                        onClick={() => handleClick("popup")}
                    >
                        {_arrow !== false && (
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                width={12}
                                height={6}
                                tipRadius={1}
                                className="arrow"
                            />
                        )}
                        <section>{contentUI}</section>
                        {actionsUI && (
                            <div
                                className="actions"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                }}
                            >
                                {actionsUI}
                            </div>
                        )}
                    </motion.div>
                </div>
            </FloatingPortal>
        </>
    );
}
