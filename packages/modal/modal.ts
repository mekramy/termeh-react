import type { ReactElement } from "react";
import { newId } from "../utils";
import type { CloseMode, Options, Stage, State } from "./types";

export interface Props {
    id: string;
    options: Options;
    element: ReactElement;
    state: State;
    stage: Stage;
    closeMode: CloseMode | null;
}

/**
 * Modal instance data. Represents a single modal with its state, content, and
 * configuration.
 */
export class Modal {
    public readonly id: string;
    public readonly options: Options;
    public readonly element: ReactElement;
    public readonly state: State;
    public readonly stage: Stage;
    public readonly closeMode: CloseMode | null;

    constructor(props: Props) {
        this.id = props.id;
        this.options = props.options;
        this.element = props.element;
        this.state = props.state;
        this.stage = props.stage;
        this.closeMode = props.closeMode;
    }

    static new(props: Pick<Props, "options" | "element">): Modal {
        return new Modal({
            id: newId(24),
            options: props.options,
            element: props.element,
            state: "idle",
            stage: "idle",
            closeMode: null,
        });
    }

    public clone(
        props: Partial<Pick<Props, "state" | "stage" | "closeMode">>
    ): Modal {
        return new Modal({
            id: this.id,
            options: this.options,
            element: this.element,
            state: props.state ?? this.state,
            stage: props.stage ?? this.stage,
            closeMode: props.closeMode ?? this.closeMode,
        });
    }

    public get isIdle(): boolean {
        return this.state === "idle";
    }

    public get isEntering(): boolean {
        return this.stage === "enter";
    }

    public get isLeaving(): boolean {
        return this.stage === "leave";
    }

    public get isRefusing(): boolean {
        return this.stage === "refuse";
    }

    public get isActive(): boolean {
        return this.state === "active";
    }

    public get isSecondary(): boolean {
        return this.state === "secondary";
    }

    public get isTertiary(): boolean {
        return this.state === "tertiary";
    }

    public get isHidden(): boolean {
        return this.state === "hidden";
    }

    public get isClosable(): boolean {
        return this.options.closable;
    }

    public get isClickable(): boolean {
        return !!this.options.onClick;
    }
}
