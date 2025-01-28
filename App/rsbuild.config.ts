import { defineConfig, rspack } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { pluginHtmlMinifierTerser } from "rsbuild-plugin-html-minifier-terser";
import path from "path";
import * as fs from "fs";
import * as toml from "@iarna/toml";
const isProduction = process.env.NODE_ENV === "production";
function getLogLevel() {
    const cargoPath = path.resolve(__dirname, "src-tauri/Cargo.toml");
    const cargoContent = fs.readFileSync(cargoPath, "utf-8");
    const cargoData = toml.parse(cargoContent) as {
        package: {
            metadata: {
                loglevel: {
                    releaseFrontend: string;
                    debugFrontend: string;
                }
            }
        }
    };
    const logLevel = isProduction
        ? cargoData.package.metadata.loglevel.releaseFrontend
        : cargoData.package.metadata.loglevel.debugFrontend;

    return logLevel;
}
function getLogLevelFlags() {
    const levels = ["trace", "debug", "info", "warn", "error"];
    const currentLevel = getLogLevel();
    const levelIndex = levels.indexOf(currentLevel);

    if (levelIndex === -1) {
        throw new Error(`Invalid log level: ${currentLevel}`);
    }

    return {
        __LOG_LEVEL_TRACE__: JSON.stringify(levelIndex <= 0),
        __LOG_LEVEL_DEBUG__: JSON.stringify(levelIndex <= 1),
        __LOG_LEVEL_INFO__: JSON.stringify(levelIndex <= 2),
        __LOG_LEVEL_WARN__: JSON.stringify(levelIndex <= 3),
        __LOG_LEVEL_ERROR__: JSON.stringify(levelIndex <= 4),
    };
}

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
                ignored: ["**/node_modules", "**/src-tauri/target/**", "**/.git/**"],
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
            plugins: [
                new rspack.DefinePlugin(getLogLevelFlags()),
            ]
        },
    },
});
