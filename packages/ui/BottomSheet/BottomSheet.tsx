import { motion } from "motion/react";
import { useRef, type HTMLAttributes, type ReactNode } from "react";
import {
    useBottomSheet,
    useScrollState,
    useTouchAction,
    useVisualViewport,
    type UseBottomSheetOptions,
} from "../../hooks";
import { classNames } from "../../utils";

type SlotProps = Pick<
    ReturnType<typeof useBottomSheet>,
    "state" | "progress" | "close" | "restore" | "expand"
>;

type BaseProps = HTMLAttributes<HTMLDivElement> &
    Omit<UseBottomSheetOptions, "viewport" | "fastClose"> & {
        height?: number;
        scrollFade?: boolean;
        body: (props: SlotProps) => ReactNode;
        header?: (props: SlotProps) => ReactNode;
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
    height: defaultHeight,
    scrollFade = true,
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

    const sheetHeight = defaultHeight ?? viewport.maxAccessibleHeight;

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
        viewport: { ...viewport, maxAccessibleHeight: sheetHeight },
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

    return (
        <motion.div
            className="bottom-sheet-wrapper"
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
