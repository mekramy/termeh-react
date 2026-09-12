import type { ProviderOptions } from "../types";

/** Returns the default options for the modal provider. */
export function getDefaults(): ProviderOptions {
    return {
        closable: false,
        stackGap: 8,
        rootClass: undefined,
        animations: {
            enter: {
                scale: 1,
                rotate: 0,

                y: ["3rem", 0],
                opacity: [0.85, 1],

                transition: {
                    duration: 0.15,
                    type: "spring",
                    stiffness: 120,
                },
            },

            leave: {
                scale: 1,
                rotate: 0,

                y: [0, "3rem"],
                opacity: [1, 0],

                transition: {
                    duration: 0.15,
                    ease: "easeOut",
                },
            },

            refuse: {
                y: 0,
                opacity: 1,

                scale: 1.1,
                rotate: -2,

                transition: {
                    duration: 0.1,
                    ease: "easeInOut",
                },
            },

            active: {
                y: 0,
                top: 0,
                scale: 1,
                rotate: 0,
                opacity: 1,

                transition: {
                    duration: 0.1,
                    type: "spring",
                    stiffness: 150,
                },
            },

            secondary: {
                y: 0,
                rotate: 0,

                top: -8,
                scale: 0.9,
                opacity: 0.9,

                transition: {
                    duration: 0.1,
                    type: "spring",
                    stiffness: 150,
                },
            },

            tertiary: {
                y: 0,
                rotate: 0,

                top: -16,
                scale: 0.8,
                opacity: 0.9,

                transition: {
                    duration: 0.1,
                    type: "spring",
                    stiffness: 150,
                },
            },

            hidden: {
                y: 0,
                top: 0,
                rotate: 0,

                scale: 0.7,
                opacity: 0,

                transition: {
                    duration: 0.1,
                    ease: "easeOut",
                },
            },
        },
    };
}
