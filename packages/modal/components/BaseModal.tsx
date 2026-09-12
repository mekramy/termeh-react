import { motion, type HTMLMotionProps } from "motion/react";
import { useMemo, useRef, type ReactNode } from "react";
import { classNames } from "../../utils";
import { useCreate } from "../hooks/useCreate";

type SlotProps = Omit<
    ReturnType<typeof useCreate>,
    | "ref"
    | "element"
    | "canScrollUp"
    | "canScrollDown"
    | "className"
    | "touchAction"
    | "motionStyles"
    | "motionListeners"
>;
type BaseProps = HTMLMotionProps<"div"> & {
    body: (props: SlotProps) => ReactNode;
    header?: (props: SlotProps) => ReactNode;
    actions?: (props: SlotProps) => ReactNode;
};

export function BaseModal({
    header,
    body,
    actions,
    className,
    ...rootProps
}: BaseProps) {
    const contentEl = useRef<HTMLDivElement>(null);
    const {
        ref,
        isMounted,

        isSheet,
        isModal,
        isAlive,
        canScrollUp,
        canScrollDown,

        close,
        action,
        loading,
        className: stateClass,
        touchAction,
        motionStyles,
        motionListeners,

        id,
        state,
        isClosable,
        isClickable,
    } = useCreate(contentEl.current ?? undefined);

    const props: SlotProps = useMemo(
        () => ({
            isMounted,
            isSheet,
            isModal,
            isAlive,

            close,
            action,
            loading,

            id,
            state,
            isClosable,
            isClickable,
        }),
        [
            isMounted,
            isSheet,
            isModal,
            isAlive,

            close,
            action,
            loading,

            id,
            state,
            isClosable,
            isClickable,
        ]
    );

    const bodyUI = body(props);
    const headerUI = header?.(props);
    const actionUI = actions?.(props);

    /** Render the bottom sheet if the modal is a sheet. */
    if (isSheet) {
        return (
            <motion.div
                id={id}
                key="sheet"
                ref={ref}
                {...rootProps}
                {...motionListeners}
                style={motionStyles}
                className="bottom-sheet-wrapper"
            >
                <div
                    className={classNames(
                        "bottom-sheet",
                        stateClass,
                        className
                    )}
                >
                    <div className="grabber">
                        <div />
                    </div>

                    {headerUI && (
                        <div className="bottom-sheet-header">{headerUI}</div>
                    )}

                    <div className="bottom-sheet-scroller">
                        <motion.div
                            ref={contentEl}
                            style={{ touchAction }}
                            className="bottom-sheet-content"
                        >
                            {bodyUI}
                        </motion.div>

                        <div
                            className={classNames(
                                "scroll-fade",
                                "is-top",
                                canScrollUp && "is-active"
                            )}
                        />

                        <div
                            className={classNames(
                                "scroll-fade",
                                "is-bottom",
                                canScrollDown && "is-active"
                            )}
                        />
                    </div>

                    {actionUI && (
                        <div
                            className="actions"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }}
                        >
                            {actionUI}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    /** Render the standard modal if the modal is not a sheet. */
    return (
        <motion.div
            id={id}
            key="modal"
            ref={ref}
            {...rootProps}
            className={classNames("modal", stateClass, className)}
        >
            <div
                className={classNames(
                    "modal-header-wrapper",
                    headerUI && "has-header"
                )}
            >
                {headerUI && <div className="modal-header">{headerUI}</div>}

                <div className="modal-fade-wrapper">
                    <div
                        className={classNames(
                            "scroll-fade",
                            canScrollUp && "is-active"
                        )}
                    />
                </div>
            </div>

            <motion.div style={{ touchAction }} className="modal-content">
                {bodyUI}
            </motion.div>

            <div
                className={classNames(
                    "modal-footer-wrapper",
                    actionUI && "has-actions"
                )}
            >
                <div className="modal-fade-wrapper">
                    <div
                        className={classNames(
                            "scroll-fade",
                            canScrollDown && "is-active"
                        )}
                    />
                </div>

                {actionUI && (
                    <div
                        className="actions"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }}
                    >
                        {actionUI}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
