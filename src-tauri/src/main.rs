//! @fileOverview 入口文件

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use techclass_lib::logs;
fn main() {
    logs::init(); // 初始化日志

    techclass_lib::run()
}
