import type {
    arrow,
    flip,
    FloatingContext,
    Middleware,
    OffsetOptions,
    Placement,
    shift,
    UseClickProps,
    UseDismissProps,
    UseHoverProps,
    UseRoleProps,
} from "@floating-ui/react";
import type { Variant } from "motion";
import type { ReactNode, Ref, RefObject } from "react";
import type { RenderableProps } from "../../utils";

/** The side on which the popup is positioned relative to its reference. */
export type Side = "top" | "left" | "bottom" | "right";

/** Interaction modes that can open the popup. */
export type Trigger = "manual" | "hover" | "click" | "focus";

/** The area that triggered a click callback. */
export type ClickArea = "popup" | "outside";

/** Open mode types for the popup component */
export type OpenMode = "manual" | "hover" | "click" | "focus";

/** The reason the popup was closed. */
export type CloseMode = "manual" | "click" | "dismiss" | "action";

/** Called when the popup opens. */
export type OpenHandler = (mode: OpenMode) => void;

/** Called when the popup closes, with the close reason. */
export type CloseHandler = (mode: CloseMode) => void;

/** Handles clicks inside the popup or outside it. */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/** Handles an action requested by the popup content. */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/** Motion variants applied to the popup. */
export type Animation =
    | Variant
    | {
          top: Variant;
          left: Variant;
          bottom: Variant;
          right: Variant;
      };

/** Open and close motion variants for the popup. */
export type Animations = {
    open: Animation;
    close: Animation;
};

/** Imperative controls exposed by the popup ref. */
export interface PopupRef {
    open: () => void;
    close: () => void;
}

/** Props for configuring and rendering the popup. */
export interface Options<T> {
    /** A ref used to imperatively open or close the popup. */
    ref?: Ref<PopupRef>;

    /**
     * The initial visibility state of the popup.
     *
     * @default "close"
     */
    initial?: "open" | "close";

    /**
     * The interaction mode(s) that can open the popup.
     *
     * @default "click"
     */
    trigger?: Trigger | Trigger[];

    /**
     * The placement of the popup relative to its reference element.
     *
     * @default "bottom"
     */
    placement?: Placement;

    /**
     * Whether user interactions can close the popup.
     *
     * @default true
     */
    closable?: boolean;

    /** The ID of the DOM node used to portal the popup into. */
    portalId?: string;

    /** The DOM node, or ref to the node, used as the portal root. */
    portalNode?: HTMLElement | RefObject<HTMLElement | null>;

    /** An additional CSS class applied to the popup. */
    className?: string;

    /** Custom open and close motion variants. */
    animations?: Animations;

    /**
     * The ARIA role assigned to the popup.
     *
     * @default "tooltip"
     */
    role?: UseRoleProps["role"];

    /**
     * The distance between the popup and its reference element.
     *
     * @default true
     */
    offset?: boolean | OffsetOptions;

    /**
     * Whether, and how, the popup flips when it overflows.
     *
     * @default true
     */
    flip?: boolean | Parameters<typeof flip>[0];

    /**
     * Whether, and how, the popup shifts when it overflows.
     *
     * @default true
     */
    shift?: boolean | Parameters<typeof shift>[0];

    /**
     * Whether, and how, the popup arrow is rendered.
     *
     * @default true
     */
    arrow?: boolean | Parameters<typeof arrow>[0];

    /**
     * Options for hover-based opening and closing.
     *
     * @default { delay: { open: 100, close: 250 }, mouseOnly: false }
     */
    hoverOptions?: Pick<UseHoverProps, "delay" | "mouseOnly">;

    /**
     * Options for click-based opening.
     *
     * @default { event: "click", toggle: true, ignoreMouse: false }
     */
    clickOptions?: Pick<UseClickProps, "event" | "ignoreMouse">;

    /**
     * Options for dismissing the popup.
     *
     * @default { escapeKey: true, outsidePress: true }
     */
    dismissOptions?: Pick<UseDismissProps, "escapeKey" | "outsidePress">;

    /** Additional Floating UI middleware. */
    middleware?: Middleware[];

    /** Called when the popup opens. */
    onOpen?: OpenHandler;

    /** Called when the popup closes. */
    onClose?: CloseHandler;

    /** Called for clicks inside the popup or outside it. */
    onClick?: ClickHandler;

    /** Called when content invokes an action. */
    onAction?: ActionHandler<T>;

    /** Renders the reference element that controls the popup. */
    source: (props: RenderSourceProps) => ReactNode;

    /** Renders the main popup content. */
    children: RenderableProps<(props: RenderContentProps<T>) => ReactNode>;

    /** Optionally renders the popup actions area. */
    actions?: (props: RenderContentProps<T>) => ReactNode;
}

/** Props provided to the source render function. */
export interface RenderSourceProps {
    /** The Floating UI context for the popup. */
    context: FloatingContext;

    /** The resolved side of the popup. */
    side: Side;

    /** Whether the popup is currently open. */
    isOpen: boolean;

    /** Whether an async click or action is in progress. */
    isLoading: boolean;

    /** Opens the popup. */
    open: () => void;

    /** Returns props to spread onto the reference element. */
    getProps: () => Record<string, unknown>;
}

/** Props provided to the content and actions render functions. */
export interface RenderContentProps<T> {
    /** The Floating UI context for the popup. */
    context: FloatingContext;

    /** The resolved side of the popup. */
    side: Side;

    /** Whether the popup is currently open. */
    isOpen: boolean;

    /** Whether an async click or action is in progress. */
    isLoading: boolean;

    /** Closes the popup. */
    close: () => void;

    /** Runs an async action identified by its key. */
    action: (key: string, data?: T) => void;
}
