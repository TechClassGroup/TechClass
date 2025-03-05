//! @fileOverview 一些常量

use lazy_static::lazy_static;
use std::{fs, path::PathBuf};

use crate::frontend_fs::{PATH_CONFIG, PATH_PLUGIN};

/// 获取当前exe的位置
fn exe_directory() -> std::path::PathBuf {
    std::env::current_exe()
        .expect("Failed to get exe's current executable path")
        .parent()
        .expect("Failed to get exe's parent directory")
        .to_path_buf()
}

pub fn init_path() {
    (|| -> Result<(), Box<dyn std::error::Error>> {
        fs::create_dir_all(PATH_BASIC.clone())?;
        fs::create_dir_all(PATH_CONFIG.clone())?;
        fs::create_dir_all(PATH_PLUGIN.clone())?;
        Ok(())
    })()
    .unwrap_or_else(|e| {
        log::error!("初始化目录时出错 {}", e);
    })
}

lazy_static! {
    /// 程序的基本路径
    pub static ref PATH_BASIC: PathBuf = exe_directory().join("data");
}

pub mod app_info {
    pub const VERSION: &str = env!("CARGO_PKG_VERSION");
    pub const NAME: &str = env!("CARGO_PKG_NAME");
}
