//! 存储管理

use std::fs::OpenOptions;
use std::io::{Read, Write};
use std::path::PathBuf;
use crate::error::IpcError;
use crate::frontend_fs::get_path;
use crate::shared::PluginType;

use log::warn;
use serde_json::Value;

const CONFIG_SUFFIX: &str = "config.json";

fn get_config_path(id: &str, plugin_type: PluginType) -> Result<PathBuf, IpcError> {
    let file_name = format!("{id}.{CONFIG_SUFFIX}");
    let config_path = get_path(id, plugin_type)?.join(&file_name);
    Ok(config_path)
}

#[tauri::command]
/// 写入内容到[id]
pub async fn storage_content(
    id: String,
    content: Value,
    plugin_type: String,
) -> Result<(), IpcError> {
    let plugin_type = PluginType::from_str(&plugin_type)?;
    let path = get_config_path(&id, plugin_type)?;
    let stringified_content = match serde_json::to_vec(&content) {
        Ok(content) => content,
        Err(e) => {
            warn!("转字符串出错 {}", e);
            return Err(IpcError::Json(e));
        }
    };

    let mut file = match OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&path)
    {
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
pub fn load_content(id: String, plugin_type: String) -> Result<Value, IpcError> {
    let plugin_type = PluginType::from_str(&plugin_type)?;
    let path = get_config_path(&id, plugin_type)?;
    if !path.exists() {
        if let Err(e) = OpenOptions::new().write(true).create(true).open(path) {
            warn!("创建文件时出错: {}", e);
            return Err(IpcError::Io(e));
        }
        log::info!("{id}所属的文件不存在，已创建");
        return Ok(Value::Null);
    }
    let mut file = match OpenOptions::new().read(true).open(&path) {
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
