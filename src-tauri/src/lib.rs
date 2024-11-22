pub mod logs;
pub mod contestants;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            logs::log_trace,
            logs::log_debug,
            logs::log_info,
            logs::log_warn,
            logs::log_error
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
