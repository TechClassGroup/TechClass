/**
 *  @fileOverview 处理nightlyBuild的数据
 */

const fs = require("fs");
const toml = require("@iarna/toml");

const cargoPath = "App/src-tauri/Cargo.toml";
const content = fs.readFileSync(cargoPath, "utf-8");
const tomlObject = toml.parse(content);

tomlObject.package.metadata.loglevel.release = "trace";
tomlObject.package.metadata.loglevel.releaseFrontend = "trace";

const newContent = toml.stringify(tomlObject);
fs.writeFileSync(cargoPath, newContent);
