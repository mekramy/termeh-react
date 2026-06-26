import type { ProviderOptions } from "../types";

/**
 * Returns the default options for the toast provider based on the specified
 * direction.
 */
export function getDefaults(direction: "rtl" | "ltr"): ProviderOptions {
    const isRTL = direction === "rtl";
    return {
        duration: 5,
        closable: true,
        direction,
        bodyClass: undefined,
        animations: {
            idle: {},
            enter: {
                opacity: [0, 1],
                translateX: [isRTL ? "-50%" : "50%", 0],

                transition: {
                    duration: 0.2,
                    type: "spring",
                    stiffness: 120,
                },
            },
            enterStack: {
                opacity: [0.65, 1],
                scale: [1.05, 1],
                translateY: ["-85%", 0],

                transition: {
                    duration: 0.2,
                    type: "spring",
                    stiffness: 120,
                },
            },
            leave: {
                opacity: [1, 0],
                translateX: [0, isRTL ? "-50%" : "50%"],

                transition: {
                    duration: 0.2,
                    ease: "easeOut",
                },
            },
            leaveStack: {
                scale: 0.9,
                translateY: "-35%",

                transition: {
                    duration: 0.2,
                    ease: "easeOut",
                },
            },
            active: {
                bottom: 0,
                scale: 1,
                opacity: 1,
                translateX: 0,
                translateY: 0,

                transition: {
                    duration: 0.1,
                    ease: "easeOut",
                },
            },
            secondary: {
                bottom: -4,
                scale: 0.9,
                opacity: 0.85,
                translateX: 0,
                translateY: 0,

                transition: {
                    duration: 0.1,
                    type: "spring",
                    stiffness: 150,
                },
            },
            tertiary: {
                bottom: -8,
                scale: 0.8,
                opacity: 0.85,
                translateX: 0,
                translateY: 0,

                transition: {
                    duration: 0.1,
                    type: "spring",
                    stiffness: 150,
                },
            },
            hidden: {
                bottom: 0,
                scale: 0.7,
                opacity: 0,
                translateX: 0,
                translateY: 0,

                transition: {
                    duration: 0.1,
                    ease: "easeOut",
                },
            },
        },
        actionBarAnimations: {
            show: {
                scale: 1,
                opacity: 1,
                translateY: 0,
                marginBottom: 0,
                transition: { duration: 0.2 },
            },
            hide: {
                scale: 0.9,
                opacity: 0,
                translateY: "50%",
                marginBottom: "-2.2rem",
                transition: { duration: 0.2, opacity: { duration: 0.4 } },
            },
        },
    };
}
