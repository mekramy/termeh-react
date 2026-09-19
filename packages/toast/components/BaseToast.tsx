import {
    useCallback,
    useMemo,
    type HTMLAttributes,
    type ReactNode,
} from "react";
import { classNames, type RenderableProps } from "../../utils";
import { useCreate } from "../hooks/useCreate";

type SlotProps = Omit<ReturnType<typeof useCreate>, "ref" | "stateClasses">;
type BaseProps = HTMLAttributes<HTMLDivElement> & {
    icon?: ReactNode;
    children: RenderableProps<(props: SlotProps) => ReactNode>;
    actions?: (props: SlotProps) => ReactNode;
};

export function BaseToast({ icon, children, actions, className }: BaseProps) {
    const {
        ref,
        id,
        mode,
        state,
        isSticky,
        isClosable,
        isClickable,
        isAutoClosing,
        isPaused,
        isLoading,
        stateClasses,
        progress,
        close,
        pause,
        resume,
        action,
    } = useCreate();

    const closeHandler = useCallback(() => {
        if (!actions && !isLoading && isClosable) close();
    }, [actions, isLoading, isClosable, close]);

    const props: SlotProps = useMemo(
        () => ({
            id,
            mode,
            state,
            isSticky,
            isClosable,
            isClickable,
            isAutoClosing,
            isPaused,
            isLoading,
            progress,
            close,
            pause,
            resume,
            action,
        }),
        [
            id,
            mode,
            state,
            isSticky,
            isClosable,
            isClickable,
            isAutoClosing,
            isPaused,
            isLoading,
            progress,
            close,
            pause,
            resume,
            action,
        ]
    );

    const bodyUI = typeof children === "function" ? children(props) : children;
    const actionsUI = actions?.(props);

    return (
        <div
            id={id}
            ref={ref}
            onClick={closeHandler}
            className={classNames("toast", stateClasses, className)}
        >
            <div className="toast-wrapper">
                {icon && <div className="toast-icon">{icon}</div>}
                <div className="toast-content">{bodyUI}</div>
            </div>
            {actionsUI && <div className="actions">{actionsUI}</div>}
            <div className="toast-progress" style={{ width: `${progress}%` }} />
        </div>
    );
}
