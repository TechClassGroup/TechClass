//! 管理日志

use log::{debug, error, info, trace, warn};


#[tauri::command]
pub fn log_trace(content: String){
    println!("{}", content);
    trace!("{}", content);
}

#[tauri::command]
pub fn log_debug(content: String) {
    debug!("{}", content);
}

#[tauri::command]
pub fn log_info(content: String) {
    info!("{}", content);
}

#[tauri::command]
pub fn log_warn(content: String) {
    warn!("{}", content);
}

#[tauri::command]
pub fn log_error(content: String) {
    error!("{}", content);
}
