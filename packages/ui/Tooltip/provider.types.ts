import type {
    arrow,
    flip,
    Middleware,
    OffsetOptions,
    Placement,
    shift,
    Strategy,
} from "@floating-ui/react";
import type { MotionNodeAnimationOptions } from "motion/react";
import type { ReactNode, Ref, RefObject } from "react";
import type {
    Animations,
    ClickArea,
    CloseHandler,
    OpenMode,
    TriggerMode,
} from "./types";

/** Called when the tooltip opens. */
export type ProviderOpenHandler = (mode: OpenMode, key: string) => void;

/** Handles clicks inside or outside the tooltip. */
export type ProviderClickHandler = (
    mode: ClickArea,
    key: string
) => Promise<boolean>;

/** Custom motion animations for the content transitions within the tooltip. */
export type ContentAnimations = {
    initial: MotionNodeAnimationOptions["initial"];
    enter: MotionNodeAnimationOptions["animate"];
    exit: MotionNodeAnimationOptions["exit"];
};

/** Imperative controls exposed by the provider ref. */
export interface ProviderRef {
    open: (key: string) => void;
    close: () => void;
}

export interface ProviderOptions {
    /** A ref used to imperatively open or close the tooltip. */
    ref?: Ref<ProviderRef>;

    /**
     * Interaction mode(s) that can open the tooltip. Use "manual" alone to
     * disable interaction triggers.
     *
     * @default "click"
     */
    trigger?: TriggerMode;

    /**
     * Interaction mode(s) that can close the tooltip. Defaults to `trigger`.
     * Use "manual" alone to disable interaction triggers.
     *
     * @default undefined
     */
    closeTrigger?: TriggerMode;

    /** The ID of the DOM node into which the tooltip is portaled. */
    portalId?: string;

    /** The DOM node or ref used as the portal root. */
    portalNode?: HTMLElement | RefObject<HTMLElement | null>;

    /** An additional CSS class for the tooltip. */
    className?: string;

    /** Custom motion variants for opening and closing. */
    animations?: Animations;

    /** Custom motion animations for the content transitions within the tooltip. */
    contentAnimations?: ContentAnimations;

    /**
     * The positioning strategy for the tooltip, determining how it is placed
     * relative to its reference element.
     *
     * @default "absolute"
     */
    strategy?: Strategy;

    /**
     * Placement of the tooltip relative to its reference element.
     *
     * @default "bottom"
     */
    placement?: Placement;

    /**
     * Distance between the tooltip and its reference element.
     *
     * @default true
     */
    offset?: boolean | OffsetOptions;

    /**
     * Whether, and how, the tooltip flips on overflow.
     *
     * @default true
     */
    flip?: boolean | Parameters<typeof flip>[0];

    /**
     * Whether, and how, the tooltip shifts on overflow.
     *
     * @default true
     */
    shift?: boolean | Parameters<typeof shift>[0];

    /**
     * Whether, and how, to render the tooltip arrow.
     *
     * @default true
     */
    arrow?: boolean | Parameters<typeof arrow>[0];

    /** Additional Floating UI middleware to apply. */
    middleware?: Middleware[];

    /**
     * Delay in milliseconds before opening after the pointer enters the
     * reference element.
     *
     * @default 250
     */
    hoverOpenDelay?: number;

    /**
     * Delay in milliseconds before closing after the pointer leaves the
     * reference element.
     *
     * @default 1000
     */
    hoverCloseDelay?: number;

    /** Called when the tooltip opens. */
    onOpen?: ProviderOpenHandler;

    /** Called when the tooltip closes. */
    onClose?: CloseHandler;

    /** Called for clicks inside or outside the tooltip. */
    onClick?: ProviderClickHandler;

    /** Content rendered within the provider. */
    children: ReactNode;
}

export interface ProviderItemOptions {
    /** Unique key identifying the tooltip item. */
    key?: string;

    /** Icon displayed in the tooltip. */
    icon?: ReactNode;

    /** Content displayed in the tooltip. */
    content: ReactNode;

    /** Whether the tooltip item is currently open. */
    isOpen?: boolean;

    /**
     * Renders the tooltip item's children and receives a ref callback for the
     * reference element.
     */
    children: (ref: RefObject<Element>) => ReactNode;
}
