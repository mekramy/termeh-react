import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
    // Global ignores
    globalIgnores(["dist", "node_modules", "*.d.ts"]),

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
            globals: globals.browser,
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            react: reactPlugin,
            "react-hooks": reactHooks,
            "jsx-a11y": jsxA11y,
            "react-refresh": reactRefresh,
        },
        extends: [
            js.configs.recommended,
            "plugin:@typescript-eslint/recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
            "plugin:jsx-a11y/recommended",
        ],
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            // General
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "warn",

            // React
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-key": "error",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-pascal-case": "warn",

            // React Hooks
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // TypeScript
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
                { prefer: "type-imports" },
            ],
            "@typescript-eslint/consistent-type-definitions": [
                "warn",
                "interface",
            ],

            // Accessibility - کمی انعطاف برای کتابخانه
            "jsx-a11y/no-autofocus": "off",
            "jsx-a11y/no-noninteractive-element-interactions": "off",
        },
    },

    // JavaScript files
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: { jsx: true },
            globals: globals.browser,
        },
        extends: [js.configs.recommended],
        rules: {
            "no-console": "off",
        },
    },

    // Config & demo files
    {
        files: ["**/*.config.*", "demo/**", "scripts/**", "test/**"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.node, ...globals.browser },
        },
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
]);
