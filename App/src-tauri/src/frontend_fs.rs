//! 前端的文件系统

use std::{
    io,
    path::{Path, PathBuf},
    sync::Arc,
};

use crate::{
    contestants::PATH_BASIC,
    error::IpcError,
    shared::{FsItemInfo, PluginType},
};
use lazy_static::lazy_static;
use log::{debug, info, warn};

lazy_static! {
    pub static ref PATH_CONFIG: PathBuf = PATH_BASIC.join("config");
    pub static ref PATH_PLUGIN: PathBuf = PATH_BASIC.join("plugins");
}
/// 获取存储路径
pub fn get_path(id: &str, plugin_type: PluginType) -> Result<PathBuf, std::io::Error> {
    let dir_path = match plugin_type {
        PluginType::Official => PATH_CONFIG.join(id),
        PluginType::Custom => PATH_PLUGIN.join(id),
    };
    // 确保目录存在
    if !dir_path.exists() {
        std::fs::create_dir_all(&dir_path)?;
    }
    Ok(dir_path)
}

pub mod fs_api {
    use super::*;
    use std::fs;

    /// 创建一个安全的路径
    #[inline]
    fn create_path(id: &str, plugin_type: &str, path: &str) -> Result<PathBuf, IpcError> {
        let plugin_type_enum = PluginType::from_str(plugin_type)?;
        let base = get_path(id, plugin_type_enum)?;
        debug!(
            "创建路径 - ID: {}, 类型: {}, 路径: {}",
            id, plugin_type, path
        );
        let target_path = base.join(path);

        Ok(target_path)
    }

    /// 检查路径状态
    #[tauri::command]
    pub async fn exists(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<FsItemInfo, IpcError> {
        let target_path: PathBuf = create_path(&id, &plugin_type, &path)?.into();
        debug!("检查路径状态 - ID: {}, 路径: {}", id, path);

        Ok(FsItemInfo {
            exists: target_path.exists(),
            is_file: target_path.is_file(),
            is_dir: target_path.is_dir(),
        })
    }

    /// 读取文件内容
    #[tauri::command]
    pub async fn read_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<String, IpcError> {
        let target_path: PathBuf = create_path(&id, &plugin_type, &path)?.into();
        if !target_path.is_file() {
            warn!("尝试读取非文件 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::NotFile);
        }
        debug!("读取文件 - ID: {}, 路径: {}", id, path);
        fs::read_to_string(target_path).map_err(IpcError::Io)
    }

    /// 写入文件内容 (带自动创建父目录)
    #[tauri::command]
    pub async fn write_file(
        id: String,
        plugin_type: String,
        path: String,
        content: String,
    ) -> Result<(), IpcError> {
        let target_path: PathBuf = create_path(&id, &plugin_type, &path)?.into();
        if target_path.is_dir() {
            warn!("尝试写入到目录 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::IsDir);
        }
        if let Some(parent) = target_path.parent() {
            debug!("创建父目录 - ID: {}, 路径: {:?}", id, parent);
            fs::create_dir_all(parent).map_err(IpcError::Io)?;
        }
        debug!("写入文件 - ID: {}, 路径: {}", id, path);
        fs::write(target_path, content).map_err(IpcError::Io)
    }

    /// 删除文件
    #[tauri::command]
    pub async fn remove_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<(), IpcError> {
        let target_path: PathBuf = create_path(&id, &plugin_type, &path)?.into();
        if !target_path.is_file() {
            warn!("尝试删除非文件 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::NotFile);
        }
        info!("删除文件 - ID: {}, 路径: {}", id, path);
        fs::remove_file(target_path).map_err(IpcError::Io)
    }

    /// 创建目录 (递归)
    #[tauri::command]
    pub async fn create_dir(id: String, plugin_type: String, path: String) -> Result<(), IpcError> {
        let target_path: PathBuf = create_path(&id, &plugin_type, &path)?.into();
        info!("创建目录 - ID: {}, 路径: {}", id, path);
        fs::create_dir_all(target_path).map_err(IpcError::Io)
    }

    /// 删除目录 (递归)
    #[tauri::command]
    pub async fn remove_dir(id: String, plugin_type: String, path: String) -> Result<(), IpcError> {
        let target_path: PathBuf = create_path(&id, &plugin_type, &path)?.into();
        if !target_path.is_dir() {
            warn!("尝试删除非目录 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::NotDir);
        }
        info!("删除目录 - ID: {}, 路径: {}", id, path);
        fs::remove_dir_all(target_path).map_err(IpcError::Io)
    }
}
