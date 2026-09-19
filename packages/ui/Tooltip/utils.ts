import type { OpenChangeReason, Placement, Side } from "@floating-ui/react";
import type { Variant } from "motion";
import type { Animation, Animations, CloseMode, OpenMode } from "./types";

/** Resolves the side of the popup from its placement */
export function resolveSide(placement: Placement): Side {
    return placement.split("-")[0] as Side;
}

/** Resolves the animation variant for the popup based on its side */
export function resolveAnimation(
    side: Side,
    animation: Animations
): { open: Variant; close: Variant } {
    const open = isDirectionalAnimation(animation.open)
        ? animation.open[side]
        : animation.open;

    const close = isDirectionalAnimation(animation.close)
        ? animation.close[side]
        : animation.close;

    return { open, close };
}

/** Resolves the close mode for the popup based on the reason it was triggered */
export function resolveCloseMode(reason?: OpenChangeReason): CloseMode {
    if (
        reason === "outside-press" ||
        reason === "escape-key" ||
        reason === "focus-out" ||
        reason === "safe-polygon"
    )
        return "dismiss";
    if (reason === "click" || reason === "reference-press") return "click";
    return "manual";
}

/** Resolves the open mode for the popup based on the reason it was triggered */
export function resolveOpenMode(reason?: OpenChangeReason): OpenMode {
    if (reason === "click" || reason === "reference-press") return "click";
    if (reason === "hover" || reason === "safe-polygon") return "hover";
    if (reason === "focus") return "focus";
    return "manual";
}

function isDirectionalAnimation(
    anim: Animation
): anim is { top: Variant; bottom: Variant; left: Variant; right: Variant } {
    return (
        typeof anim === "object" &&
        "top" in anim &&
        "bottom" in anim &&
        "left" in anim &&
        "right" in anim
    );
}
