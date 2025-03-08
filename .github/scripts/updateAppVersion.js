/**
 * @fileOverview 处理应用程序的版本号 需要用--version版本号
 */
const fs = require("fs");
const toml = require("@iarna/toml");
const path = require("path");

const PATHS = {
    PACKAGE: path.resolve("App/package.json"),
    TAURI: path.resolve("App/src-tauri/tauri.conf.json"),
    CARGO: path.resolve("App/src-tauri/Cargo.toml"),
};

// 获取命令行参数中的版本号
const args = process.argv.slice(2);
const versionArg = args.find((arg) => arg.startsWith("--version="));

if (!versionArg) {
    console.error("请提供版本号参数，例如: --version=1.0.0");
    process.exit(1);
}

const newVersion = versionArg.split("=")[1];

// 更新package.json
try {
    console.log("📦 正在更新 package.json");
    const packageJson = JSON.parse(fs.readFileSync(PATHS.PACKAGE, "utf-8"));
    packageJson.version = newVersion;
    fs.writeFileSync(PATHS.PACKAGE, JSON.stringify(packageJson, null, 2));
    console.log("✅ package.json 更新成功");
} catch (error) {
    console.error("❌ 更新 package.json 失败:", error.message);
    process.exit(1);
}

// 更新tauri.conf.json
try {
    console.log("🔧 正在更新 tauri.conf.json");
    const tauriJson = JSON.parse(fs.readFileSync(PATHS.TAURI, "utf-8"));
    tauriJson.version = newVersion;
    fs.writeFileSync(PATHS.TAURI, JSON.stringify(tauriJson, null, 2));
    console.log("✅ tauri.conf.json 更新成功");
} catch (error) {
    console.error("❌ 更新 tauri.conf.json 失败:", error.message);
    process.exit(1);
}

// 更新Cargo.toml
try {
    console.log("📦 正在更新 Cargo.toml");
    const cargoContent = fs.readFileSync(PATHS.CARGO, "utf-8");
    const cargoData = toml.parse(cargoContent);
    cargoData.package.version = newVersion;
    fs.writeFileSync(PATHS.CARGO, toml.stringify(cargoData));
    console.log("✅ Cargo.toml 更新成功");
} catch (error) {
    console.error("❌ 更新 Cargo.toml 失败:", error.message);
    process.exit(1);
}

console.log("🎉 版本更新完成！");
