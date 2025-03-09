/**
 *  @fileOverview 处理nightlyBuild的数据
 */

const fs = require("fs");
const toml = require("@iarna/toml");

const cargoPath = "App/src-tauri/Cargo.toml";

try {
    if (!fs.existsSync(cargoPath)) {
        throw new Error(`配置文件不存在: ${cargoPath}`);
    }

    const tomlObject = toml.parse(fs.readFileSync(cargoPath, "utf-8"));
    const {
        release,
        releaseFrontend,
    } = tomlObject.package.metadata.loglevel;

    Object.assign(tomlObject.package.metadata.loglevel, {
        release: "trace",
        releaseFrontend: "trace",
    });

    console.log(
        `日志级别已更新: release(${
            release || "未设置"
        } -> trace), releaseFrontend(${releaseFrontend || "未设置"} -> trace)`,
    );

    fs.writeFileSync(cargoPath, toml.stringify(tomlObject));
    console.log("✅ 配置更新完成");
} catch (error) {
    console.error("❌ 错误:", error.message);
    process.exit(1);
}
