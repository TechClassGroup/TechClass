/**
 * @fileOverview 更新更新日志
 */
const fs = require("fs");
const toml = require("@iarna/toml");
const path = require("path");
const luxon = require("luxon");

// 获取命令行参数中的版本号
const args = process.argv.slice(2);
const versionArg = args.find((arg) => arg.startsWith("--version="));

if (!versionArg) {
    console.error("请提供版本号参数，例如: --version=1.0.0");
    process.exit(1);
}
const dateToday = luxon.DateTime.now().setZone("UTC+8").toFormat("yyyy-MM-dd");
const newVersion = versionArg.split("=")[1];
console.log(`开始更新更新日志，版本号: ${newVersion}, 日期: ${dateToday}`);
// 替换的对象
const replaceObject = {
    "%VERSION%": newVersion,
    "%DATE%": dateToday,
};
const changelogTemplate = path.resolve(
    ".github/markdownTemplates/changeLog.md",
);
console.log(`使用模板文件: ${changelogTemplate}`);
const targetPath = path.resolve(`docs/src/changelogs/${newVersion}.md`);
// 逻辑部分
let changelogContent = fs.readFileSync(changelogTemplate, "utf-8");
console.log("模板文件读取成功");

for (const [key, value] of Object.entries(replaceObject)) {
    changelogContent = changelogContent.replaceAll(key, value);
}
console.log("模板文件替换成功", changelogContent);
// 写入文件
fs.writeFileSync(targetPath, changelogContent);
console.log(`更新日志文件已生成：${targetPath}`);
