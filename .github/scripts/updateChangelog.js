/**
 * @fileOverview 更新更新日志
 */
const fs = require("fs");
const toml = require("@iarna/toml");
const path = require("path");


// 获取命令行参数中的版本号
const args = process.argv.slice(2);
const versionArg = args.find((arg) => arg.startsWith("--version="));

if (!versionArg) {
    console.error("请提供版本号参数，例如: --version=1.0.0");
    process.exit(1);
}

const newVersion = versionArg.split("=")[1];