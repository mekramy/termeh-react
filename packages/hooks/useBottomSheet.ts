import type { ValueAnimationTransition } from "motion";
import { useTransform } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { useLatest } from "./useLatest";
import type { PointerType } from "./useMotionPan";
import { useMotionPanSnap } from "./useMotionPanSnap";
import { useVisualViewport } from "./useVisualViewport";

type BottomSheetState = "closed" | "normal" | "expanded";

const NORMAL_MAPPING: BottomSheetState[] = ["normal", "closed"] as const;

const EXPANDED_MAPPING: BottomSheetState[] = [
    "expanded",
    "normal",
    "closed",
] as const;

export interface UseBottomSheetOptons {
    /** Sheet height in pixels */
    height: number;

    /**
     * Viewport height in pixels.
     *
     * @default `window.innerHeight`
     */
    viewport?: number;

    /**
     * Top gap on expanded state
     *
     * @default 0
     */
    gap?: number;

    /**
     * Opacity tuple to calculate on close swipe
     *
     * @default [1, 0.5]
     */
    opacityRange?: [number, number];

    /**
     * Initial state.
     *
     * @default "normal" (half of viewport)
     */
    initial?: "normal" | "expanded";

    /**
     * Allow text selection while dragging.
     *
     * @default false
     */
    textSelect?: boolean;

    /**
     * Allowed pointer types.
     *
     * @default all
     */
    pointerTypes?: PointerType[];

    /** Animation used when snapping to a point */
    transition?: ValueAnimationTransition;

    /** Disable dragging */
    disabled?: () => boolean;

    /** Called when sheet open */
    onOpen?: () => void;

    /** Called when sheet settles to half state (normal) */
    onRestore?: () => void;

    /** Called when sheet settles to expanded state */
    onExpand?: () => void;

    /** Called when sheet settles to closed state */
    onClose?: () => void;
}

/**
 * Manages the position, state, and snapping behavior of a bottom sheet.
 *
 * @param options Configuration for the sheet height, viewport, initial state,
 *   gesture behavior, and callbacks.
 * @returns The sheet position, current and next states, drag progress, gesture
 *   handlers, styles, and actions to close, restore, or expand the sheet.
 */
export function useBottomSheet({
    height,
    viewport: viewportProp,
    gap = 0,
    opacityRange = [1, 0.5],
    initial = "normal",
    textSelect = false,
    pointerTypes,
    transition,
    disabled,
    onOpen,
    onClose,
    onRestore,
    onExpand,
}: UseBottomSheetOptons) {
    // Measuring and stats
    const { height: vpHeight } = useVisualViewport();
    const mountedRef = useRef(false);
    const viewport = viewportProp ?? vpHeight;
    const closed = viewport;
    const normal = viewport - Math.min(height, viewport / 2);
    const expanded = viewport - Math.min(height, viewport - gap);

    // Driven Stats
    const canExpand = expanded < normal;
    const points = canExpand ? [expanded, normal, closed] : [normal, closed];
    const mapping: BottomSheetState[] = canExpand
        ? EXPANDED_MAPPING
        : NORMAL_MAPPING;
    const callbacksRef = useLatest({ onOpen, onClose, onRestore, onExpand });
    const initialState = canExpand ? initial : "normal";

    // Core pan/snap hook
    const onSnap = useCallback(
        (index: number) => {
            if (!mountedRef.current) return;
            const state = mapping[index];
            const { onClose, onRestore, onExpand } = callbacksRef.current;

            switch (state) {
                case "closed":
                    return onClose?.();
                case "normal":
                    return onRestore?.();
                case "expanded":
                    return onExpand?.();
            }
        },
        [mapping, callbacksRef]
    );
    const { x, y, progress, snap, nextSnap, handlers, style, snapTo } =
        useMotionPanSnap({
            axis: "y",
            points,
            initial: mapping.indexOf(initialState),
            textSelect,
            pointerTypes,
            transition,
            disabled,
            onSnap: onSnap,
        });

    // Programmatic actions with callbacks
    const close = useCallback(() => {
        snapTo(mapping.indexOf("closed"));
    }, [mapping, snapTo]);

    const restore = useCallback(() => {
        snapTo(mapping.indexOf("normal"));
    }, [mapping, snapTo]);

    const expand = useCallback(() => {
        if (!canExpand) return restore();

        snapTo(mapping.indexOf("expanded"));
    }, [canExpand, mapping, restore, snapTo]);

    // Stats
    const state = mapping[snap];
    const nextState = mapping[nextSnap];
    const opacity = useTransform(
        progress,
        [0, 1],
        state !== "closed" && nextState === "closed" ? opacityRange : [1, 1]
    );

    // Fire open event
    useEffect(() => {
        mountedRef.current = true;
        const { onOpen } = callbacksRef.current;
        onOpen?.();

        return () => {
            mountedRef.current = false;
        };
    }, [callbacksRef]);

    return {
        x,
        y,
        progress,
        style,
        handlers,
        state,
        nextState,
        opacity,
        canExpand,
        close,
        restore,
        expand,
    };
}
