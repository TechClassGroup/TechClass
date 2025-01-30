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

/// 安全的路径缓冲区，确保所有操作都在基础路径下进行
#[derive(Debug, Clone)]
pub struct SafePathBuf {
    /// 基础路径（从 get_path 获得的路径）
    base: Arc<PathBuf>,
    /// 相对于基础路径的路径
    relative: PathBuf,
}

impl SafePathBuf {
    /// 创建一个新的安全路径
    pub fn build(base: PathBuf) -> std::io::Result<Self> {
        Ok(SafePathBuf {
            base: Arc::new(base.canonicalize()?),
            relative: PathBuf::new(),
        })
    }
    pub fn join<P: AsRef<Path>>(&self, path: P) -> std::io::Result<Self> {
        let relative = self.relative.join(path).canonicalize()?;
        let joined_path = self.base.join(&relative).canonicalize()?;
        let is_safe = joined_path.starts_with(self.base.as_path());

        if is_safe {
            Ok(Self {
                base: Arc::clone(&self.base),
                relative,
            })
        } else {
            Err(io::Error::new(
                io::ErrorKind::PermissionDenied,
                "Path traversal detected",
            ))
        }
    }
}

impl Into<PathBuf> for SafePathBuf {
    fn into(self) -> PathBuf {
        self.base.join(self.relative)
    }
}

pub mod fs_api {
    use super::*;
    use std::fs;

    /// 创建一个安全的路径
    #[inline]
    fn create_safe_path(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<SafePathBuf, IpcError> {
        let plugin_type = PluginType::from_str(&plugin_type)?;
        let base = get_path(&id, plugin_type)?;
        let mut safe_path = SafePathBuf::build(base)?;

        if !path.is_empty() {
            safe_path = match safe_path.join(path) {
                Ok(path) => path,
                Err(e) if e.kind() == io::ErrorKind::PermissionDenied => {
                    return Err(IpcError::PathPermissionDenied(e.to_string()))
                }
                Err(e) => return Err(IpcError::Io(e))
            };
        };
        Ok(safe_path)
    }

    /// 检查路径状态
    #[tauri::command]
    pub async fn exists(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<FsItemInfo, IpcError> {
        let safe_path: PathBuf = create_safe_path(id, plugin_type, path)?.into();

        Ok(FsItemInfo {
            exists: safe_path.exists(),
            is_file: safe_path.is_file(),
            is_dir: safe_path.is_dir(),
        })
    }

    /// 读取文件内容
    #[tauri::command]
    pub async fn read_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<String, IpcError> {
        let safe_path: PathBuf = create_safe_path(id, plugin_type, path)?.into();
        if !safe_path.is_file() {
            return Err(IpcError::NotFile);
        }
        fs::read_to_string(safe_path).map_err(IpcError::Io)
    }

    /// 写入文件内容 (带自动创建父目录)
    #[tauri::command]
    pub async fn write_file(
        id: String,
        plugin_type: String,
        path: String,
        content: String,
    ) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(id, plugin_type, path)?.into();
        if let Some(parent) = safe_path.parent() {
            fs::create_dir_all(parent).map_err(IpcError::Io)?;
        }
        fs::write(safe_path, content).map_err(IpcError::Io)
    }

    /// 删除文件
    #[tauri::command]
    pub async fn remove_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(id, plugin_type, path)?.into();
        if !safe_path.is_file() {
            return Err(IpcError::NotFile);
        }
        fs::remove_file(safe_path).map_err(IpcError::Io)
    }

    /// 创建目录 (递归)
    #[tauri::command]
    pub async fn create_dir(id: String, plugin_type: String, path: String) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(id, plugin_type, path)?.into();
        fs::create_dir_all(safe_path).map_err(IpcError::Io)
    }

    /// 删除目录 (递归)
    #[tauri::command]
    pub async fn remove_dir(id: String, plugin_type: String, path: String) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(id, plugin_type, path)?.into();
        if !safe_path.is_dir() {
            return Err(IpcError::NotDir);
        }
        fs::remove_dir_all(safe_path).map_err(IpcError::Io)
    }
}
