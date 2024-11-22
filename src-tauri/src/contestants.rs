//! @fileOverview 一些常量

/// 获取当前exe的位置
fn exe_directory() -> std::path::PathBuf {
    std::env::current_exe()
        .expect("Failed to get current executable path")
        .parent()
        .expect("Failed to get parent directory")
        .to_path_buf()
}
/// 有关文件路径的常量
pub mod files_path {
    /// 目录
    pub mod directory {
        use crate::contestants::exe_directory;
        use lazy_static::lazy_static;
        use std::path::PathBuf;

        lazy_static! {
            pub static ref BASIC: PathBuf = exe_directory().join("data");
            pub static ref LOG: PathBuf = BASIC.join("log");
        }
    }
    /// 文件
    pub mod file {
        pub static LOG_PREFIX: &str = "logs.log";
    }
}
