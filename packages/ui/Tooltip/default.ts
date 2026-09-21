import type { ContentAnimations } from "./provider.types";
import type { Animations } from "./types";

export const DEFAULT_ANIMATIONS: Animations = {
    open: {
        top: { opacity: 1, scale: 1, transformOrigin: "bottom center" },
        bottom: { opacity: 1, scale: 1, transformOrigin: "top center" },
        left: { opacity: 1, scale: 1, transformOrigin: "right center" },
        right: { opacity: 1, scale: 1, transformOrigin: "left center" },
    },
    close: {
        top: {
            opacity: 0,
            scale: 0.2,
            transformOrigin: "bottom center",
        },
        bottom: {
            opacity: 0,
            scale: 0.2,
            transformOrigin: "top center",
        },
        left: {
            opacity: 0,
            scale: 0.2,
            transformOrigin: "right center",
        },
        right: {
            opacity: 0,
            scale: 0.2,
            transformOrigin: "left center",
        },
    },
};

export const PROVIDER_ANIMATIONS: ContentAnimations = {
    initial: {
        x: "50%",
        opacity: 0,
        filter: "blur(5px)",
    },
    enter: {
        x: "0%",
        opacity: 1,
        filter: "blur(0px)",
        transition: { type: "spring", duration: 0.4, bounce: 0.12 },
    },
    exit: {
        x: "-50%",
        opacity: 0,
        filter: "blur(5px)",
        transition: { type: "spring", duration: 0.2, bounce: 0.12 },
    },
};

export const DEFAULT_HOVER_OPTIONS = {
    delay: { open: 250, close: 500 },
};
