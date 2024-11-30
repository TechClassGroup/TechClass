//! 管理日志

use flexi_logger::{detailed_format, Cleanup, Criterion, Duplicate, FileSpec, Naming};
use log::{debug, error, info, trace, warn};

use crate::contestants::logging;

/// 初始化日志系统
pub fn init() {
    flexi_logger::Logger::try_with_str("trace")
        .unwrap()
        .log_to_file(
            FileSpec::default()
                .basename(logging::LOG_PREFIX)
                .directory(logging::PATH_LOG.as_path())
                .suffix(logging::LOG_SUFFIX),
        )
        .rotate(
            Criterion::Size(logging::MAX_SIZE),
            Naming::Timestamps,
            Cleanup::KeepLogFiles(logging::ROTATE_COUNT),
        )
        .write_mode(flexi_logger::WriteMode::BufferAndFlush)
        .duplicate_to_stdout(Duplicate::All)
        .format_for_files(detailed_format)
        .start()
        .unwrap();
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
