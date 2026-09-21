import type {
    arrow,
    flip,
    FloatingContext,
    Middleware,
    OffsetOptions,
    Placement,
    shift,
    Strategy,
    UseClickProps,
    UseDismissProps,
    UseHoverProps,
} from "@floating-ui/react";
import type { Variant } from "motion";
import type { ReactNode, Ref, RefObject } from "react";
import type { RenderableProps } from "../../utils";

/** The side on which the tooltip is positioned relative to its reference. */
export type Side = "top" | "left" | "bottom" | "right";

/** Interaction modes that can open or close the popup. */
export type Trigger = "hover" | "click" | "focus";

/**
 * Trigger configuration: either fully manual, or one or more interaction
 * triggers.
 */
export type TriggerMode = "manual" | Trigger | Trigger[];

/** The area that triggered a click callback. */
export type ClickArea = "tooltip" | "outside";

/** Open mode types for the tooltip component */
export type OpenMode = "manual" | "hover" | "click" | "focus";

/** The reason the tooltip was closed. */
export type CloseMode = "manual" | "click" | "dismiss";

/** Called when the tooltip opens. */
export type OpenHandler = (mode: OpenMode) => void;

/** Called when the tooltip closes, with the close reason. */
export type CloseHandler = (mode: CloseMode) => void;

/** Handles clicks inside the tooltip or outside it. */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/** Motion variants applied to the tooltip. */
export type Animation =
    | Variant
    | {
          top: Variant;
          left: Variant;
          bottom: Variant;
          right: Variant;
      };

/** Open and close motion variants for the tooltip. */
export type Animations = {
    open: Animation;
    close: Animation;
};

/** Imperative controls exposed by the tooltip ref. */
export interface TooltipRef {
    open: () => void;
    close: () => void;
}

/** Props for configuring and rendering the tooltip. */
export interface Options {
    /** A ref used to imperatively open or close the tooltip. */
    ref?: Ref<TooltipRef>;

    /**
     * The initial visibility state of the tooltip.
     *
     * @default "close"
     */
    initial?: "open" | "close";

    /**
     * The interaction mode(s) that can open the popup. Use "manual" alone to
     * disable all interaction triggers.
     *
     * @default "click"
     */
    trigger?: TriggerMode;

    /**
     * The interaction mode(s) that can close the popup. By default follow
     * trigger. Use "manual" alone to disable all interaction triggers.
     *
     * @default undefined
     */
    closeTrigger?: TriggerMode;

    /**
     * Whether user interactions can close the tooltip.
     *
     * @default true
     */
    closable?: boolean;

    /** The ID of the DOM node used to portal the tooltip into. */
    portalId?: string;

    /** The DOM node, or ref to the node, used as the portal root. */
    portalNode?: HTMLElement | RefObject<HTMLElement | null>;

    /** An additional CSS class applied to the tooltip. */
    className?: string;

    /** Custom open and close motion variants. */
    animations?: Animations;

    /**
     * The positioning strategy for the tooltip, determining how it is placed
     * relative to its reference element.
     *
     * @default "absolute"
     */
    strategy?: Strategy;

    /**
     * The placement of the tooltip relative to its reference element.
     *
     * @default "bottom"
     */
    placement?: Placement;

    /**
     * The distance between the tooltip and its reference element.
     *
     * @default true
     */
    offset?: boolean | OffsetOptions;

    /**
     * Whether, and how, the tooltip flips when it overflows.
     *
     * @default true
     */
    flip?: boolean | Parameters<typeof flip>[0];

    /**
     * Whether, and how, the tooltip shifts when it overflows.
     *
     * @default true
     */
    shift?: boolean | Parameters<typeof shift>[0];

    /**
     * Whether, and how, the tooltip arrow is rendered.
     *
     * @default true
     */
    arrow?: boolean | Parameters<typeof arrow>[0];

    /** Additional Floating UI middleware. */
    middleware?: Middleware[];

    /**
     * Options for hover-based opening and closing.
     *
     * @default { delay: { open: 250, close: 500 }, mouseOnly: false }
     */
    hoverOptions?: Pick<UseHoverProps, "delay" | "mouseOnly">;

    /**
     * Options for click-based opening.
     *
     * @default { event: "click", toggle: true, ignoreMouse: false }
     */
    clickOptions?: Pick<UseClickProps, "event" | "ignoreMouse">;

    /**
     * Options for dismissing the tooltip.
     *
     * @default { escapeKey: true, outsidePress: true }
     */
    dismissOptions?: Pick<UseDismissProps, "escapeKey" | "outsidePress">;

    /** Called when the tooltip opens. */
    onOpen?: OpenHandler;

    /** Called when the tooltip closes. */
    onClose?: CloseHandler;

    /** Called for clicks inside the tooltip or outside it. */
    onClick?: ClickHandler;

    /** Renders the reference element that controls the tooltip. */
    source: (props: RenderSourceProps) => ReactNode;

    /** Renders the main tooltip content. */
    children: RenderableProps<(props: RenderContentProps) => ReactNode>;

    /** The icon displayed in the tooltip. */
    icon?: ReactNode;
}

/** Props provided to the source render function. */
export interface RenderSourceProps {
    /** The Floating UI context for the tooltip. */
    context: FloatingContext;

    /** The resolved side of the tooltip. */
    side: Side;

    /** Whether the tooltip is currently open. */
    isOpen: boolean;

    /** Whether an async click or action is in progress. */
    isLoading: boolean;

    /** Opens the tooltip. */
    open: () => void;

    /** Returns props to spread onto the reference element. */
    getProps: () => Record<string, unknown>;
}

/** Props provided to the content and actions render functions. */
export interface RenderContentProps {
    /** The Floating UI context for the tooltip. */
    context: FloatingContext;

    /** The resolved side of the tooltip. */
    side: Side;

    /** Whether the tooltip is currently open. */
    isOpen: boolean;

    /** Whether an async click or action is in progress. */
    isLoading: boolean;

    /** Closes the tooltip. */
    close: () => void;
}
