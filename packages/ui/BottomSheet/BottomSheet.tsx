import { motion } from "motion/react";
import {
    useImperativeHandle,
    useRef,
    type HTMLAttributes,
    type ReactNode,
    type Ref,
} from "react";
import {
    useBottomSheet,
    useScrollState,
    useStableCallback,
    useTouchAction,
    useVisualViewport,
    type UseBottomSheetOptions,
} from "../../hooks";
import { classNames } from "../../utils";

type SlotProps = Pick<
    ReturnType<typeof useBottomSheet>,
    "state" | "progress" | "close" | "restore" | "expand"
>;

export type BottomSheetRef = {
    close: () => void;
    restore: () => void;
    expand: () => void;
};

type BaseProps = HTMLAttributes<HTMLDivElement> &
    Omit<UseBottomSheetOptions, "viewport" | "fastClose"> & {
        /**
         * The ref object that allows imperative control over the bottom sheet
         * (close, restore, expand).
         */
        ref?: Ref<BottomSheetRef>;

        /**
         * Whether to enable the scroll fade effect at the top and bottom of the
         * content.
         */
        scrollFade?: boolean;

        /** The click event handler for the bottom sheet wrapper element. */
        onWrapperClick?: (props: SlotProps) => void;

        /**
         * The render function for the body slot of the bottom sheet. It
         * receives the current state and control functions as props.
         *
         * @param props The slot props containing state and control functions.
         * @returns The React node to render inside the body slot.
         */
        body: (props: SlotProps) => ReactNode;

        /**
         * The render function for the header slot of the bottom sheet. It
         * receives the current state and control functions as props.
         *
         * @param props The slot props containing state and control functions.
         * @returns The React node to render inside the header slot.
         */
        header?: (props: SlotProps) => ReactNode;

        /**
         * The render function for the actions slot of the bottom sheet. It
         * receives the current state and control functions as props.
         *
         * @param props The slot props containing state and control functions.
         * @returns The React node to render inside the actions slot.
         */
        actions?: (props: SlotProps) => ReactNode;
    };

export function BottomSheet({
    gap,
    expandable,
    closable,
    enterAnimation,
    elasticExpand,
    opacityRange,
    elastic,
    disabled,
    threshold,
    velocityThreshold,
    fastVelocityThreshold,
    transition,
    pointerTypes,
    onOpen,
    onRestore,
    onExpand,
    onClose,
    ref,
    scrollFade = true,
    onWrapperClick,
    header,
    body,
    actions,
    className,
    ...divProps
}: BaseProps) {
    const contentEl = useRef<HTMLDivElement>(null);

    const viewport = useVisualViewport();
    const scrollState = useScrollState(contentEl.current, { threshold: 10 });
    const touchAction = useTouchAction(scrollState, {
        axis: "y",
        fallback: "none",
    });

    const {
        state,
        progress,
        y,
        height,
        opacity,
        close,
        restore,
        expand,
        onPan,
        onPanStart,
        onPanEnd,
    } = useBottomSheet({
        viewport,
        gap,
        expandable,
        closable,
        fastClose: closable,
        enterAnimation,
        elasticExpand,
        opacityRange,
        elastic,
        disabled,
        threshold,
        velocityThreshold,
        fastVelocityThreshold,
        transition,
        pointerTypes,
        onOpen,
        onRestore,
        onExpand,
        onClose,
    });

    const props: SlotProps = {
        state,
        progress,
        close,
        restore,
        expand,
    };

    const handleWrapperClick = useStableCallback<
        React.MouseEventHandler<HTMLDivElement>
    >((e) => {
        if (!onWrapperClick || e.target !== e.currentTarget) return;

        e.preventDefault();
        e.stopPropagation();
        onWrapperClick(props);
    });

    useImperativeHandle(
        ref,
        () => ({
            close,
            restore,
            expand,
        }),
        [close, restore, expand]
    );

    return (
        <motion.div
            className="bottom-sheet-wrapper"
            onClick={handleWrapperClick}
            onPan={onPan}
            onPanStart={onPanStart}
            onPanEnd={onPanEnd}
            style={{ y, height, opacity, touchAction }}
        >
            <div
                {...divProps}
                className={classNames("bottom-sheet", `is-${state}`, className)}
            >
                <div className="grabber">
                    <div />
                </div>

                {header && (
                    <div className="bottom-sheet-header">{header(props)}</div>
                )}

                <div className="bottom-sheet-scroller">
                    <motion.div
                        ref={contentEl}
                        style={{ touchAction }}
                        className="bottom-sheet-content"
                    >
                        {body(props)}
                    </motion.div>

                    {scrollFade && (
                        <div
                            className={classNames(
                                "scroll-fade",
                                "is-top",
                                scrollState.canScrollUp && "is-active"
                            )}
                        />
                    )}

                    {scrollFade && (
                        <div
                            className={classNames(
                                "scroll-fade",
                                "is-bottom",
                                scrollState.canScrollDown && "is-active"
                            )}
                        />
                    )}
                </div>

                {actions && (
                    <div
                        className="actions"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }}
                    >
                        {actions(props)}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
