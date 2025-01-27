import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { pluginHtmlMinifierTerser } from "rsbuild-plugin-html-minifier-terser";
import path from "path";

export default defineConfig({
    plugins: [pluginVue(), pluginHtmlMinifierTerser()],
    html: {
        template: "index.html",
    },
    source: {
        entry: {
            index: "./src/index.ts",
        },
    },
    server: {
        port: 1420,
    },
    tools: {
        rspack: {
            watchOptions: {
                ignored: ["**/node_modules", "**/src-tauri/**", "**/.git/**"],
            },
            resolve: {
                extensions: [".js", ".ts", ".json"],
                alias: {
                    "@scripts": path.resolve(__dirname, "scripts"),
                },
            },
            module: {
                rules: [
                    {
                        test: /\.md$/,
                        use: [
                            {
                                loader: "builtin:swc-loader",
                                options: {
                                    sourceMap: true,
                                    jsc: {
                                        parser: {
                                            syntax: "typescript",
                                        },
                                    },
                                },
                            },
                            {
                                loader: path.resolve(
                                    __dirname,
                                    "scripts/markdownLoader.js"
                                ),
                            },
                        ],
                    },
                ],
            },
        },
    },
});
