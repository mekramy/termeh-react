import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
    // Global ignores
    globalIgnores([
        "dist",
        "node_modules",
        "*.d.ts",
        "coverage",
        "*.config.js",
    ]),

    // TypeScript + React
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true },
                project: ["./tsconfig.json"],
            },
            globals: {
                ...globals.browser,
                React: "readonly",
                JSX: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            react: reactPlugin,
            "react-hooks": reactHooks,
        },
        extends: [
            js.configs.recommended,
            "plugin:@typescript-eslint/recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
        ],
        settings: {
            react: { version: "detect" },
        },
        rules: {
            "no-console": ["warn", { allow: ["warn", "error"] }],

            // === React ===
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-key": "error",
            "react/jsx-no-duplicate-props": "error",

            // === Hooks ===
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // === TypeScript ===
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/consistent-type-imports": [
                "warn",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports",
                },
            ],

            // === Code Quality ===
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/await-thenable": "warn",
            "@typescript-eslint/no-unnecessary-condition": "warn",

            // === Comments ===
            "lines-around-comment": [
                "warn",
                {
                    beforeLineComment: true,
                    beforeBlockComment: true,
                    allowBlockStart: true,
                    allowObjectStart: true,
                    allowArrayStart: true,
                },
            ],
        },
    },

    // Global files
    {
        files: ["**/*.{js,jsx,mjs,cjs,json}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.node, ...globals.browser },
        },
        rules: {
            "no-console": "off",
        },
    },
]);
