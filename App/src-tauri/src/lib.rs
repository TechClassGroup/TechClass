use frontend_fs::fs_api;

pub mod contestants;
pub mod error;
pub mod frontend_fs;
pub mod logs;
pub mod shared;
pub mod storage;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            logs::log_trace,
            logs::log_debug,
            logs::log_info,
            logs::log_warn,
            logs::log_error,
            storage::storage_content,
            storage::load_content,
            fs_api::exists,
            fs_api::read_file,
            fs_api::write_file,
            fs_api::remove_file,
            fs_api::create_dir,
            fs_api::remove_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
