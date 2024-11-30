//! @fileOverview 一些常量

/// 获取当前exe的位置
fn exe_directory() -> std::path::PathBuf {
    std::env::current_exe()
        .expect("Failed to get exe's current executable path")
        .parent()
        .expect("Failed to get exe's parent directory")
        .to_path_buf()
}
/// 基本的常量
pub mod base {
    use std::path::PathBuf;

    use lazy_static::lazy_static;

    use crate::contestants::exe_directory;

    lazy_static! {
        /// 程序的基本路径
        pub static ref PATH_BASIC: PathBuf = exe_directory().join("data");
    }
    /// 程序的名字
    pub const NAME_APP: &str = "Techclass";
}

pub mod logging {
    use std::path::PathBuf;

    use lazy_static::lazy_static;

    use crate::contestants::base::PATH_BASIC;

    use super::base::NAME_APP;

    lazy_static! {
        pub static ref PATH_LOG: PathBuf = PATH_BASIC.join("log");
    }
    // 前缀与后缀
    pub const LOG_PREFIX: &str = NAME_APP;
    pub const LOG_SUFFIX: &str = "log";

    pub const MAX_SIZE: u64 = 10 * 1024 * 1024; // 10MB
    pub const ROTATE_COUNT: usize = 10;
}
