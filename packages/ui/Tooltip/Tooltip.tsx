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
    Trigger,
} from "./types";
import {
    resolveAnimation,
    resolveCloseMode,
    resolveOpenMode,
    resolveSide,
} from "./utils";

/**
 * Tooltip component for displaying floating content.
 *
 * @param options - Configuration options for the tooltip.
 * @returns The Tooltip component.
 */
export function Tooltip({
    ref,
    initial = "close",
    trigger = "click",
    closeTrigger,
    closable = true,
    portalId,
    portalNode,
    className,
    animations = DEFAULT_ANIMATIONS,

    strategy,
    placement = "bottom",
    offset: _offset = true,
    flip: _flip = true,
    shift: _shift = true,
    arrow: _arrow = true,
    middleware = [],

    hoverOptions = DEFAULT_HOVER_OPTIONS,
    clickOptions,
    dismissOptions,

    onOpen,
    onClose,
    onClick,

    source,
    children,
    icon,
}: Options) {
    const arrowRef = useRef<SVGSVGElement>(null);

    // Lifecycle
    const isMounted = useIsMounted();
    const { nextVersion, verifyVersion } = useVersionToken();

    // Stats
    const [isOpen, setIsOpen] = useState(initial === "open");
    const [isLoading, setIsLoading] = useState(false);

    // Normalize and memoize
    const isManual = trigger === "manual";
    const triggers = useMemoize(
        isManual ? [] : Array.isArray(trigger) ? trigger : [trigger]
    );
    const closeTriggers = useMemoize(
        closeTrigger === undefined
            ? null
            : closeTrigger === "manual"
              ? []
              : Array.isArray(closeTrigger)
                ? closeTrigger
                : [closeTrigger]
    );
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
    const canCloseWith = useStableCallback(
        (target: Trigger) =>
            !isOpen || !closeTriggers || closeTriggers.includes(target)
    );

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

    // Hook to manage the floating element's positioning and behavior
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        strategy,
        placement,
        middleware: middlewares,
        onOpenChange: handleOpenChange,
        whileElementsMounted: autoUpdate,
    });

    const role = useRole(context, { role: "tooltip" });
    const hover = useHover(context, {
        ...hoverOptions,
        handleClose: safePolygon(),
        enabled:
            !isManual &&
            !isLoading &&
            triggers.includes("hover") &&
            canCloseWith("hover"),
    });
    const focus = useFocus(context, {
        enabled:
            !isManual &&
            !isLoading &&
            triggers.includes("focus") &&
            canCloseWith("focus"),
    });
    const click = useClick(context, {
        ...clickOptions,
        toggle: false,
        enabled:
            !isManual &&
            !isLoading &&
            triggers.includes("click") &&
            canCloseWith("click"),
    });
    const dismiss = useDismiss(context, {
        ...dismissOptions,
        enabled: !isManual && !isLoading && closable,
        outsidePress:
            !closeTriggers || closeTriggers.includes("click")
                ? (dismissOptions?.outsidePress ?? true)
                : false,
    });
    const { getReferenceProps, getFloatingProps } = useInteractions([
        role,
        hover,
        focus,
        click,
        dismiss,
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
    const contentProps: RenderContentProps = useMemo(
        () => ({
            context,
            side,
            isOpen,
            isLoading,
            close,
        }),
        [context, side, isOpen, isLoading, close]
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
    const bodyUI =
        typeof children === "function" ? children(contentProps) : children;

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
                            "tooltip",
                            isLoading && "is-loading",
                            className
                        )}
                        onClick={() => handleClick("tooltip")}
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

                        {icon && <div className="tooltip-icon">{icon}</div>}
                        <div className="tooltip-content">{bodyUI}</div>
                    </motion.div>
                </div>
            </FloatingPortal>
        </>
    );
}
