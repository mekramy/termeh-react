import type { Variant } from "motion";
import type { ReactElement } from "react";

/** Toast display mode: default mode or sticky (persistent) mode. */
export type Mode = "default" | "sticky";

/** Toast lifecycle animation. */
export type Stage =
    | "idle"
    | "enter"
    | "enterStack"
    | "leave"
    | "leaveStack"
    | "active"
    | "secondary"
    | "tertiary"
    | "hidden";

/** Toast visibility state. */
export type State = "idle" | "active" | "secondary" | "tertiary" | "hidden";

/** Toast closure trigger mode. */
export type CloseMode = "click" | "manual" | "timer" | "action";

/** Simple callback. */
export type Callback = () => void;

/** Toast Open event handler. Invoked on toast open. */
export type OpenHandler = () => void;

/** Toast close event handler. Invoked when a toast is being closed. */
export type CloseHandler = (mode: CloseMode) => void;

/** Toast click event handler. Invoked when the toast element is clicked. */
export type ClickHandler = () => Promise<boolean>;

/**
 * Toast action handler. Invoked when an action button on the toast is
 * triggered.
 */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/**
 * Action bar animation variants. Defines animation configurations for showing
 * and hiding provider action bar.
 */
export interface ActionBarAnimation {
    /** Animation variant for showing the action bar */
    show: Variant;

    /** Animation variant for hiding the action bar */
    hide: Variant;
}

/**
 * Set of animations for a toast container. Maps each stage of the toast
 * lifecycle to a corresponding animation variant. Individual entries are
 * optional for advanced customizations.
 */
export type Animations = {
    [K in Stage]: Variant;
};

/**
 * Toast configuration options. Defines behavior and event handlers for a toast
 * instance.
 */
export interface Options {
    /** Duration in milliseconds before the toast auto-closes (0 = no auto-close) */
    duration: number;

    /** Whether the toast can be manually closed by user click */
    closable: boolean;

    /** Callback invoked when the toast is displayed */
    onOpen: OpenHandler | undefined;

    /** Callback invoked when the toast is closed */
    onClose: CloseHandler | undefined;

    /** Handler invoked when the toast is clicked */
    onClick: ClickHandler | undefined;

    /** Handler invoked when a toast action is triggered */
    onAction: ActionHandler | undefined;
}

/**
 * Default provider configuration options. Defines global settings for all
 * toasts managed by the ToastProvider.
 */
export interface ProviderOptions {
    /** Default duration for auto-closing toasts (in milliseconds) */
    duration: number;

    /** Whether toasts are closable by default */
    closable: boolean;

    /** Text direction: right-to-left or left-to-right */
    direction: "rtl" | "ltr";

    /** CSS class to apply to the <body> element */
    bodyClass: string | undefined;

    /** Animation variants for toast stages */
    animations: Animations | undefined;

    /** Animation variants for provider action bar */
    actionBarAnimations: ActionBarAnimation | undefined;
}

/**
 * Toast instance data. Represents a single toast message with its state,
 * content, and configuration.
 */
export interface Toast {
    /** Unique identifier for the toast */
    id: string;

    /** Display mode: default or sticky */
    mode: Mode;

    /** Current visibility state */
    state: State;

    /** Current animation stage */
    stage: Stage;

    /** Toast configuration and event handlers */
    options: Options;

    /** React element to render as toast content */
    element: ReactElement;

    /** The reason the toast was closed, or null if still open */
    closeMode: CloseMode | null;
}

/**
 * Toast provider interface. Provides methods to manage the lifecycle and
 * behavior of toasts.
 */
export interface Provider {
    /** Add a new toast to the container. */
    add(toast: Toast): void;

    /** Close (hide) a specific toast. */
    close: (id: string, mode: CloseMode) => void;

    /** Remove a closed toast from the container. */
    remove(id: string): void;

    /** Close and remove all toasts. */
    clear(): void;

    /** Get the current default options for new toasts. */
    getOptions(): Partial<ProviderOptions>;
}

/**
 * Toast state store interface. Manages toast state and provides methods for
 * subscription and manipulation.
 */
export interface Store {
    /** Get the current toast state snapshot. */
    getSnapshot: () => {
        isStacked: boolean;
        toasts: Map<string, Toast>;
    };

    /** Subscribe to state changes. */
    subscribe: (fn: Callback) => Callback;

    /** Set the stacked state for toasts. */
    setStacked: (v: boolean) => void;

    /** Add a new toast to the store. */
    add: (toast: Toast) => void;

    /** Close a specific toast. */
    close: (id: string, mode: CloseMode) => void;

    /** Remove a closed toast from the store. */
    remove: (id: string) => void;

    /** Close and remove all toasts from the store. */
    clear: () => void;
}
