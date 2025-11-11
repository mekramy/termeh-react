import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // =============================================
    // Global Ignores
    // =============================================
    {
        ignores: [
            "dist/",
            "node_modules/",
            "*.d.ts",
            "coverage/",
            "*.config.*",
        ],
    },

    // =============================================
    // Base JavaScript & TypeScript Configs
    // =============================================
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // =============================================
    // React Configuration (JSX/TSX Files)
    // =============================================
    {
        files: ["**/*.{jsx,tsx}"],
        plugins: {
            react,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,

            // React Rules
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/jsx-key": "error",
            "react/jsx-no-duplicate-props": "error",
            "react/jsx-no-useless-fragment": "warn",
            "react/jsx-pascal-case": "warn",
            "react/self-closing-comp": [
                "warn",
                {
                    component: true,
                    html: true,
                },
            ],
            "react/jsx-curly-brace-presence": [
                "warn",
                { props: "never", children: "never" },
            ],
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                React: "readonly",
                JSX: "readonly",
            },
        },
    },

    // =============================================
    // TypeScript Specific Rules
    // =============================================
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            // Console rules (ESLint core)
            "no-console": ["warn", { allow: ["warn", "error"] }],

            // TypeScript Rules
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
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
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": "warn",
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/await-thenable": "warn",
            "@typescript-eslint/no-unnecessary-condition": "warn",
            "@typescript-eslint/array-type": [
                "warn",
                { default: "array-simple" },
            ],

            // Code Quality
            "prefer-const": "warn",
            "prefer-template": "warn",
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true },
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    // =============================================
    // React Hooks Configuration
    // =============================================
    {
        files: ["**/*.{jsx,tsx,ts}"],
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },

    // =============================================
    // JavaScript Files (Non-TS) - ESLint Core Rules
    // =============================================
    {
        files: ["**/*.{js,jsx,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            "no-console": "off",
            "prefer-const": "warn",
            "prefer-template": "warn",
        },
    },

    // =============================================
    // Test Files Configuration
    // =============================================
    {
        files: ["**/*{test,spec}.*", "**/__tests__/**"],
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    }
);
