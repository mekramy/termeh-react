import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
import pkg from "./package.json" with { type: "json" };

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
                index: resolve(import.meta.dirname, "packages/index.ts"),
                utils: resolve(import.meta.dirname, "packages/utils/index.ts"),
                signer: resolve(
                    import.meta.dirname,
                    "packages/signer/index.ts"
                ),
                hooks: resolve(import.meta.dirname, "packages/hooks/index.ts"),
                mq: resolve(import.meta.dirname, "packages/mq/index.ts"),
                mask: resolve(import.meta.dirname, "packages/mask/index.ts"),
                form: resolve(import.meta.dirname, "packages/form/index.ts"),
                lister: resolve(
                    import.meta.dirname,
                    "packages/lister/index.ts"
                ),
                toast: resolve(import.meta.dirname, "packages/toast/index.ts"),
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
        react(),

        babel({
            presets: [reactCompilerPreset()],
        }),

        dts({
            insertTypesEntry: true,
            copyDtsFiles: true,
            include: ["packages"],
        }),
        viteStaticCopy({
            targets: [
                { src: "./packages/style.scss", dest: "." },
                { src: "./packages/toast/scss", dest: "./toast" },
                { src: "./packages/toast/style.scss", dest: "./toast" },
            ],
        }),
    ],
});
