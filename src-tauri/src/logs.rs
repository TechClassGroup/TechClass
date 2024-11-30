//! 管理日志

use log::{trace, debug, info, warn, error};
use tracing_subscriber::util::SubscriberInitExt;

use crate::contestants::files_path;
use tracing_subscriber::prelude::__tracing_subscriber_SubscriberExt;
use tracing_subscriber::Registry;

/// 初始化日志系统
pub fn init() {
    // 设置时间格式
    let time_fmt = time::format_description::parse(
        "[year]-[month padding:zero]-[day padding:zero] [hour]:[minute]:[second]",
    )
    .unwrap();
    let time_offset =
        time::UtcOffset::current_local_offset().unwrap_or_else(|_| time::UtcOffset::UTC);
    let timer = tracing_subscriber::fmt::time::OffsetTime::new(time_offset, time_fmt);
    // 文件附加
    let file_appender = tracing_appender::rolling::daily(
        files_path::directory::LOG.as_path(),
        files_path::file::LOG_PREFIX,
    );
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);
    // 创建两个不同的日志输出
    // 控制台 支持ansi
    let console_layer = tracing_subscriber::fmt::layer()
        .with_writer(std::io::stdout)
        .with_ansi(true)
        .with_timer(timer.clone());

    // 文件 不支持ansi 防止出现问题
    let file_layer = tracing_subscriber::fmt::layer()
        .with_writer(non_blocking)
        .with_timer(timer)
        .with_ansi(false);
    // init logger
    Registry::default()
        .with(file_layer)
        .with(console_layer)
        .init();

    info!("日志已初始化");
}



#[tauri::command]
/// 从前端以trace的等级记录日志
pub fn log_trace(content: String) {
    trace!("[From frontend] {}", content);
}

#[tauri::command]
/// 从前端以debug的等级记录日志
pub fn log_debug(content: String) {
    debug!("[From frontend] {}", content);
}

#[tauri::command]
/// 从前端以info的等级记录日志
pub fn log_info(content: String) {
    info!("[From frontend] {}", content);
}

#[tauri::command]
/// 从前端以warn的等级记录日志
pub fn log_warn(content: String) {
    warn!("[From frontend] {}", content);
}

#[tauri::command]
/// 从前端以error的等级记录日志
pub fn log_error(content: String) {
    error!("[From frontend] {}", content);
}
