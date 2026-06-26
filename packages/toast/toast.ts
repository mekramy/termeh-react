import type { ReactElement } from "react";
import { newId } from "../utils";
import type { CloseMode, Mode, Options, Stage, State } from "./types";

export interface Props {
    id: string;
    mode: Mode;
    options: Options;
    element: ReactElement;
    state: State;
    stage: Stage;
    closeMode: CloseMode | null;
}

/**
 * Toast instance data. Represents a single toast message with its state,
 * content, and configuration.
 */
export class Toast {
    public readonly id: string;
    public readonly mode: Mode;
    public readonly options: Options;
    public readonly element: ReactElement;
    public readonly state: State;
    public readonly stage: Stage;
    public readonly closeMode: CloseMode | null;

    static new(props: Pick<Props, "mode" | "options" | "element">): Toast {
        return new Toast({
            id: newId(24),
            mode: props.mode,
            options: props.options,
            element: props.element,
            state: "idle",
            stage: "idle",
            closeMode: null,
        });
    }

    constructor(props: Props) {
        this.id = props.id;
        this.mode = props.mode;
        this.state = props.state;
        this.stage = props.stage;
        this.options = props.options;
        this.element = props.element;
        this.closeMode = props.closeMode;
    }

    public clone(
        props: Partial<Pick<Props, "state" | "stage" | "closeMode">>
    ): Toast {
        return new Toast({
            id: this.id,
            mode: this.mode,
            options: this.options,
            element: this.element,
            state: props.state ?? this.state,
            stage: props.stage ?? this.stage,
            closeMode: props.closeMode ?? this.closeMode,
        });
    }

    public get isLeaving(): boolean {
        return this.stage === "leave" || this.stage === "leaveStack";
    }

    public get isEntering(): boolean {
        return this.stage === "enter" || this.stage === "enterStack";
    }

    public get isIdle(): boolean {
        return this.state === "idle";
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

    public get isSticky(): boolean {
        return this.mode === "sticky";
    }

    public get isClosable(): boolean {
        return this.options.closable;
    }

    public get isAutoClosing(): boolean {
        return (
            this.mode !== "sticky" &&
            !!this.options.duration &&
            this.options.duration > 0
        );
    }
}
