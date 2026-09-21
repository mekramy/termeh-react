import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingPortal,
    offset,
    shift,
    useFloating,
    type Middleware,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "motion/react";
import {
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react";
import {
    useComputed,
    useIsMounted,
    useMemoize,
    useStableCallback,
    useVersionToken,
} from "../../hooks";
import { classNames } from "../../utils";
import { TooltipProviderItem } from "./TooltipProvider.Item";
import { DEFAULT_ANIMATIONS, PROVIDER_ANIMATIONS } from "./default";
import { ProviderContext } from "./provider.context";
import type { ProviderOptions } from "./provider.types";
import type { ClickArea, CloseMode, OpenMode, Trigger } from "./types";
import { isEventOn, resolveAnimation, resolveSide } from "./utils";

interface Item {
    icon?: ReactNode;
    content: ReactNode;
    element: RefObject<Element>;
}

const TooltipProvider = ({
    ref,
    trigger = "click",
    closeTrigger,
    portalId,
    portalNode,
    className,
    animations = DEFAULT_ANIMATIONS,
    contentAnimations = PROVIDER_ANIMATIONS,

    strategy,
    placement = "bottom",
    offset: _offset = true,
    flip: _flip = true,
    shift: _shift = true,
    arrow: _arrow = true,
    middleware = [],

    hoverOpenDelay = 250,
    hoverCloseDelay = 1000,

    onOpen,
    onClose,
    onClick,

    children,
}: ProviderOptions) => {
    const arrowRef = useRef<SVGSVGElement>(null);
    const hoverOpenTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const hoverCloseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Lifecycle
    const isMounted = useIsMounted(() => {
        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        document.addEventListener("click", onDocumentClick);
        document.addEventListener("pointerenter", onPointerEnter, true);
        document.addEventListener("pointerleave", onPointerLeave, true);

        return () => {
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
            document.removeEventListener("click", onDocumentClick);
            document.removeEventListener("pointerenter", onPointerEnter, true);
            document.removeEventListener("pointerleave", onPointerLeave, true);
            clearHoverTimers();
        };
    });
    const { nextVersion, verifyVersion } = useVersionToken();

    // Provider Stats
    const [activeId, setActiveId] = useState<string | null>(null);
    const [elements, setElements] = useState<Map<string, Item>>(new Map());

    // Stats
    const [isOpen, setIsOpen] = useState(false);
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
    const clearHoverTimers = useStableCallback(() => {
        clearTimeout(hoverOpenTimer.current);
        clearTimeout(hoverCloseTimer.current);
    });

    const canCloseWith = useStableCallback(
        (target: Trigger) =>
            !isOpen || !closeTriggers || closeTriggers.includes(target)
    );

    const canOpenWith = useStableCallback(
        (target: Trigger) => isOpen || triggers.includes(target)
    );

    const scheduleOpen = useStableCallback((key: string, mode: OpenMode) => {
        const item = elements.get(key);
        if (!item?.element.current) return;

        clearHoverTimers();
        setActiveId(key);
        refs.setPositionReference(item.element.current);
        if (!isOpen) {
            setIsOpen(true);
            onOpen?.(mode, key);
        }
    });

    const scheduleClose = useStableCallback((mode: CloseMode) => {
        clearHoverTimers();

        if (isOpen) {
            setIsOpen(false);
            onClose?.(mode);
        }
    });

    const handleClick = useStableCallback((target: ClickArea) => {
        if (isLoading || !isOpen || !activeId || typeof onClick !== "function")
            return;

        const version = nextVersion();
        setIsLoading(true);
        onClick(target, activeId)
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

    // Event Listeners
    const onExitComplete = useStableCallback(() => {
        if (!isOpen) setActiveId(null);
    });

    const onFocusIn = useStableCallback((ev: FocusEvent) => {
        if (isManual || isLoading || !canOpenWith("focus")) return;

        for (const [key, { element }] of elements) {
            if (isEventOn(element.current, ev, true)) {
                scheduleOpen(key, "focus");
                break;
            }
        }
    });

    const onFocusOut = useStableCallback((ev: FocusEvent) => {
        if (isManual || isLoading || !canCloseWith("focus")) return;

        for (const [, { element }] of elements) {
            if (isEventOn(element.current, ev, true)) {
                scheduleClose("dismiss");
                break;
            }
        }
    });

    const onPointerEnter = useStableCallback((ev: PointerEvent) => {
        if (isManual || isLoading || !canOpenWith("hover")) return;

        for (const [key, { element }] of elements) {
            if (isEventOn(element.current, ev)) {
                clearHoverTimers();
                hoverOpenTimer.current = setTimeout(
                    () => scheduleOpen(key, "hover"),
                    hoverOpenDelay
                );
                break;
            }
        }
    });

    const onPointerLeave = useStableCallback((ev: PointerEvent) => {
        if (isManual || isLoading || !canCloseWith("hover")) return;

        for (const [, { element }] of elements) {
            if (isEventOn(element.current, ev)) {
                clearHoverTimers();
                hoverCloseTimer.current = setTimeout(
                    () => scheduleClose("dismiss"),
                    hoverCloseDelay
                );
                break;
            }
        }
    });

    const onDocumentClick = useStableCallback((ev: MouseEvent) => {
        if (isLoading) return;

        if (!isManual && canOpenWith("click")) {
            for (const [key, { element }] of elements) {
                if (isEventOn(element.current, ev, true)) {
                    scheduleOpen(key, "click");
                    return;
                }
            }
        }

        if (!isOpen || !canCloseWith("click")) return;

        const onReference =
            !!activeId &&
            isEventOn(elements.get(activeId)?.element.current, ev);
        const onFloating = isEventOn(refs.floating.current, ev);
        if (onReference || onFloating) return;

        if (typeof onClick === "function") {
            handleClick("outside");
        } else {
            scheduleClose("dismiss");
        }
    });

    // Global  API
    const register = useStableCallback(
        (
            key: string,
            element: RefObject<Element>,
            content: ReactNode,
            icon?: ReactNode
        ) => {
            setElements((prev) => {
                const next = new Map(prev);
                next.set(key, { icon, content, element });
                return next;
            });
        }
    );

    const unRegister = useStableCallback((key: string) => {
        if (!elements.has(key)) return;

        if (activeId === key) scheduleClose("manual");
        setElements((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
        });
    });

    const open = useCallback(
        (key: string) => {
            if (isLoading) return;
            scheduleOpen(key, "manual");
        },
        [isLoading, scheduleOpen]
    );

    const close = useCallback(() => {
        if (isLoading || !isOpen) return;
        scheduleClose("manual");
    }, [isLoading, isOpen, scheduleClose]);

    const ctx = useMemo(
        () => ({
            register,
            unRegister,
            open,
            close,
        }),
        [register, unRegister, open, close]
    );

    useImperativeHandle(
        ref,
        () => ({
            open,
            close,
        }),
        [open, close]
    );

    // Implement Floating ui
    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        strategy,
        placement,
        middleware: middlewares,
        whileElementsMounted: autoUpdate,
    });

    // Driven value
    const side = resolveSide(context.placement);
    const variants = resolveAnimation(side, animations);
    const active = activeId ? elements.get(activeId) : undefined;

    return (
        <ProviderContext value={ctx}>
            {children}

            <FloatingPortal id={portalId} root={portalNode}>
                <div
                    ref={refs.setFloating}
                    style={{
                        ...floatingStyles,
                        pointerEvents: isOpen ? "auto" : "none",
                        transition: "transform 0.3s ease-out",
                    }}
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

                        {active?.icon && (
                            <div className="tooltip-icon">{active.icon}</div>
                        )}

                        <AnimatePresence
                            mode="popLayout"
                            onExitComplete={onExitComplete}
                        >
                            <motion.div
                                key={activeId}
                                initial={contentAnimations.initial}
                                exit={contentAnimations.exit}
                                animate={contentAnimations.enter}
                                transition={{ duration: 0.1, ease: "easeOut" }}
                                className="tooltip-content"
                            >
                                {active?.content ?? ""}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </FloatingPortal>
        </ProviderContext>
    );
};

TooltipProvider.Item = TooltipProviderItem;
export { TooltipProvider };
