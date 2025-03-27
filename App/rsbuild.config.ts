import {defineConfig, type RsbuildConfig, rspack} from "@rsbuild/core";
import {pluginVue} from "@rsbuild/plugin-vue";
import {pluginHtmlMinifierTerser} from "rsbuild-plugin-html-minifier-terser";
import path from "path";
import * as fs from "fs";
import * as toml from "@iarna/toml";
import {pluginImageCompress} from "@rsbuild/plugin-image-compress";

const isProduction = process.env.NODE_ENV === "production";
console.log(`[构建环境] 当前环境: ${isProduction ? "Release" : "Production"}`);

type webviewTargetType = "webview2" | "WKWebView" | "WebKitGTK";
const webviewTarget: webviewTargetType =
    (process.env.WEBVIEW_TARGET as webviewTargetType) || "webview2";
console.log(`[Webview目标] 使用的webview类型: ${webviewTarget}`);

function getLogLevel() {
    const cargoPath = path.resolve(__dirname, "src-tauri/Cargo.toml");
    console.log(`[配置读取] 正在读取Cargo配置文件: ${cargoPath}`);

    try {
        const cargoContent = fs.readFileSync(cargoPath, "utf-8");
        const cargoData = toml.parse(cargoContent) as {
            package: {
                metadata: {
                    loglevel: {
                        releaseFrontend: string;
                        debugFrontend: string;
                    };
                };
            };
        };
        const logLevel = isProduction
            ? cargoData.package.metadata.loglevel.releaseFrontend
            : cargoData.package.metadata.loglevel.debugFrontend;
        console.log(`[日志级别] 当前配置的日志级别: ${logLevel}`);
        return logLevel;
    } catch (error) {
        console.error(`[错误] 读取Cargo配置文件失败:`, error);
        throw error;
    }
}

function getLogLevelFlags() {
    const levels = ["trace", "debug", "info", "warn", "error"];
    const currentLevel = getLogLevel();
    const levelIndex = levels.indexOf(currentLevel);

    if (levelIndex === -1) {
        throw new Error(`Invalid log level: ${currentLevel}`);
    }
    const result = {
        __LOG_LEVEL_TRACE__: JSON.stringify(levelIndex <= 0),
        __LOG_LEVEL_DEBUG__: JSON.stringify(levelIndex <= 1),
        __LOG_LEVEL_INFO__: JSON.stringify(levelIndex <= 2),
        __LOG_LEVEL_WARN__: JSON.stringify(levelIndex <= 3),
        __LOG_LEVEL_ERROR__: JSON.stringify(levelIndex <= 4),
        __IS_DEV__: JSON.stringify(!isProduction),
    };
    console.log(`[日志级别] 日志级别标志:`, result);
    return result;
}

const browserList: Record<webviewTargetType, any> = {
    webview2: {},
    WKWebView: {},
    WebKitGTK: {},
}
const browserListTarget = browserList[webviewTarget];
console.log(`[浏览器列表] 当前使用的浏览器列表: ${browserListTarget}`);
export default defineConfig({
    plugins: [
        pluginVue(),
        pluginHtmlMinifierTerser(),
        pluginImageCompress(["pngLossless", "jpeg", "svg", "ico", "avif"]),
    ],
    html: {
        template: "index.html",
    },
    source: {
        entry: {
            index: "./src/index.ts",
        },
    },
    server: {
        port: 1422,
    },
    dev: {
        hmr: false,
        liveReload: true,
    },
    tools: {
        rspack: {
            watchOptions: {
                ignored: [
                    "**/node_modules",
                    "**/src-tauri/target/**",
                    "**/.git/**",
                ],
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
            plugins: [new rspack.DefinePlugin(getLogLevelFlags())],
        },

    },
    output: {
        overrideBrowserslist: browserListTarget
    }

} as RsbuildConfig);
