//! 存储管理

use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::path::PathBuf;

use crate::{contestants::PATH_BASIC, error::IpcError};
use lazy_static::lazy_static;
use log::warn;
use serde_json::Value;

lazy_static! {
    pub static ref PATH_CONFIG: PathBuf = PATH_BASIC.join("config");
}
const CONFIG_SUFFIX: &str = "config.json";

/// 获取存储路径
fn get_path(id: &str) -> PathBuf {
    let file_name = format!("{id}.{CONFIG_SUFFIX}");
    PATH_CONFIG.join(&file_name)
}

#[tauri::command]
/// 写入内容到[id]
pub async fn storage_content(id: String, content: Value) -> Result<(), IpcError> {
    let path = get_path(&id);
    let stringified_content = match serde_json::to_vec(&content) {
        Ok(content) => content,
        Err(e) => {
            warn!("转字符串出错 {}", e);
            return Err(IpcError::Json(e));
        }
    };
    let mut file = match OpenOptions::new().write(true).create(true).open(&path) {
        Ok(file) => file,
        Err(e) => {
            warn!("打开文件时出错: {}", e);
            return Err(IpcError::Io(e));
        }
    };

    if let Err(e) = file.write_all(&stringified_content) {
        warn!("Failed to write to file: {}", e);
        return Err(IpcError::Io(e));
    }
    log::trace!("成功为 [{id}] 存储内容");

    Ok(())
}
#[tauri::command]
/// 把存储着[id]的内容读取出来
pub fn load_content(id: String) -> Result<Value, IpcError> {
    let path = get_path(&id);
    let mut file = match OpenOptions::new().read(true).create(true).open(&path) {
        Ok(file) => file,
        Err(e) => {
            warn!("打开文件时出错: {}", e);
            return Err(IpcError::Io(e));
        }
    };
    let mut content = String::new();
    if let Err(e) = file.read_to_string(&mut content) {
        warn!("读取文件内容时出错: {}", e);
        return Err(IpcError::Io(e));
    }

    let json_content: Value = match serde_json::from_str(&content) {
        Ok(content) => content,
        Err(e) => {
            warn!("解析 JSON 内容时出错: {}", e);
            return Err(IpcError::Json(e));
        }
    };

    Ok(json_content)
}
