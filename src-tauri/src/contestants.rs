//! @fileOverview 一些常量

use lazy_static::lazy_static;
use std::path::PathBuf;

/// 获取当前exe的位置
fn exe_directory() -> std::path::PathBuf {
    std::env::current_exe()
        .expect("Failed to get exe's current executable path")
        .parent()
        .expect("Failed to get exe's parent directory")
        .to_path_buf()
}

lazy_static! {
    /// 程序的基本路径
    pub static ref PATH_BASIC: PathBuf = exe_directory().join("data");
}

pub mod app_info {
    pub const VERSION: &str = env!("CARGO_PKG_VERSION");
    pub const NAME: &str = env!("CARGO_PKG_NAME");
}
