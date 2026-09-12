import type { ValueAnimationTransition, Variant } from "motion";
import type { Modal } from "./modal";

/** Modal clicked area: either the modal content or the dimmer. */
export type ClickArea = "modal" | "dimmer";

/** Modal lifecycle animation. */
export type Stage =
    | "idle"
    | "enter"
    | "leave"
    | "refuse"
    | "active"
    | "secondary"
    | "tertiary"
    | "hidden";

/** Modal visibility state. */
export type State = "idle" | "active" | "secondary" | "tertiary" | "hidden";

/** Modal closure trigger mode. */
export type CloseMode = "click" | "swipe" | "manual" | "dimmer" | "action";

/** Simple callback. */
export type Callback = () => void;

/** Modal Open event handler. Invoked on modal open. */
export type OpenHandler = () => void;

/** Modal close event handler. Invoked when a modal is being closed. */
export type CloseHandler = (mode: CloseMode) => void;

/** Modal click event handler. Invoked when the modal element is clicked. */
export type ClickHandler = (mode: ClickArea) => Promise<boolean>;

/**
 * Modal action handler. Invoked when an action button on the modal is
 * triggered.
 */
export type ActionHandler<T = unknown> = (
    key: string,
    data?: T
) => Promise<boolean>;

/**
 * Set of animations for a modal container. Maps each stage of the modal
 * lifecycle to a corresponding animation variant. Individual entries are
 * optional for advanced customizations.
 */
export type Animations = {
    [K in Exclude<Stage, "idle">]: Variant;
} & {
    sheet?: ValueAnimationTransition;
};

/**
 * Modal configuration options. Defines behavior and event handlers for a modal
 * instance.
 */
export interface Options {
    /** Whether the modal can be manually closed by user click on dimmer */
    closable: boolean;

    /** Callback invoked when the modal is displayed */
    onOpen?: OpenHandler;

    /** Callback invoked when the modal is closed */
    onClose?: CloseHandler;

    /** Handler invoked when the modal or dimmer is clicked */
    onClick?: ClickHandler;

    /** Handler invoked when a modal action is triggered */
    onAction?: ActionHandler;
}

/**
 * Default provider configuration options. Defines global settings for all
 * modals managed by the ModalProvider.
 */
export interface ProviderOptions {
    /** Whether modals are closable by default */
    closable: boolean;

    /** The vertical gap between stacked modals. */
    stackGap: number;

    /** CSS class to apply to the <html> element */
    rootClass: string | undefined;

    /** Animation variants for modal stages */
    animations: Animations;
}

/**
 * Modal provider interface. Provides methods to manage the lifecycle and
 * behavior of modals.
 */
export interface Provider {
    /** Indicates whether the application is running on a mobile device. */
    isMobile: boolean;

    /** The unique identifier for the modal container. */
    id: string;

    /** Default options for new modals. */
    options: Partial<ProviderOptions>;

    /** The number of currently active modals. */
    modalCount: number;

    /**
     * Reference to the dimmer element that overlays the application when modals
     * are open
     */
    dimmerEl: HTMLElement | null;

    /** Indicates whether the modal container can be scrolled up. */
    canScrollUp: boolean;

    /** Indicates whether the modal container can be scrolled down. */
    canScrollDown: boolean;

    /** Add a new modal to the container. */
    add(modal: Modal): void;

    /** Refuse (shake) a specific modal. */
    refuse: (id: string) => void;

    /** Close (hide) a specific modal. */
    close: (id: string, mode: CloseMode) => void;

    /** Remove a closed modal from the container. */
    remove(id: string): void;
}

/**
 * Modal state store interface. Manages modal state and provides methods for
 * subscription and manipulation.
 */
export interface Store {
    /** Get the current modal state snapshot. */
    getSnapshot: () => {
        isMobile: boolean;
        modals: ReadonlyMap<string, Modal>;
    };

    /** Subscribe to state changes. */
    subscribe: (fn: Callback) => Callback;

    /** Add a new modal to the store. */
    add: (modal: Modal) => void;

    /** Refuse (shake) a specific modal. */
    refuse: (id: string) => void;

    /** Close a specific modal. */
    close: (id: string, mode: CloseMode) => void;

    /** Remove a closed modal from the store. */
    remove: (id: string) => void;

    /** Handle the completion of a modal's animation. */
    handleAnimationComplete: (modal: Modal, animation: Stage) => void;
}
