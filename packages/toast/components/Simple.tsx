import {
    type HTMLAttributes,
    type PropsWithChildren,
    type ReactElement,
} from "react";
import { classNames } from "../../utils";
import { useCreate } from "../hooks/useCreate";

type SimpleProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    icon?: ReactElement;
    primary?: string;
    secondary?: string;
};

export function Simple({
    icon,
    primary,
    secondary,
    children,
    className,
}: SimpleProps) {
    const { ref, stateClasses, progress, close, action } = useCreate();
    const hasActions = !!primary || !!secondary;

    return (
        <div
            className={classNames(
                "toast",
                "is-simple",
                stateClasses,
                className
            )}
            onClick={() => !hasActions && close()}
            ref={ref}
        >
            <div className="toast-wrapper">
                {icon && <div className="toast-icon">{icon}</div>}
                <div className="toast-content">{children}</div>
            </div>
            {hasActions && (
                <div className="toast-actions">
                    {primary && (
                        <button
                            className="action"
                            onClick={(e) => {
                                e.stopPropagation();
                                action("primary");
                            }}
                        >
                            {primary || "Confirm"}
                        </button>
                    )}
                    {secondary && (
                        <button
                            className="action is-secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                action("secondary");
                            }}
                        >
                            {secondary}
                        </button>
                    )}
                </div>
            )}
            <div className="toast-progress" style={{ width: `${progress}%` }} />
        </div>
    );
}
