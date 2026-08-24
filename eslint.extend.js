export default [
    {
        name: "@termeh/react-hooks",
        rules: {
            "react-hooks/exhaustive-deps": [
                "warn",
                { additionalHooks: "(useIsomorphicLayoutEffect)" },
            ],
        },
    },
];
