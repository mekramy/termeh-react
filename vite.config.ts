import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
import pkg from "./package.json";

/// <reference types="vitest" />
// Configure Vitest (https://vitest.dev/config/)
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            formats: ["es"],
            name: "TermehReact",
            entry: {
                index: resolve(__dirname, "packages/index.ts"),
                utils: resolve(__dirname, "packages/utils/index.ts"),
                hooks: resolve(__dirname, "packages/hooks/index.ts"),
                mask: resolve(__dirname, "packages/mask/index.ts"),
                form: resolve(__dirname, "packages/form/index.ts"),
            },
            fileName: (format, entry) => {
                if (entry === "index") {
                    return `index.mjs`;
                }

                return `${entry}/index.mjs`;
            },
        },

        rollupOptions: {
            external: [...Object.keys(pkg.peerDependencies || {})],
        },
    },
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
        dts({
            insertTypesEntry: true,
            copyDtsFiles: true,
            include: ["packages"],
        }),
        viteStaticCopy({
            targets: [{ src: "./packages/style.scss", dest: "." }],
        }),
    ],
});
