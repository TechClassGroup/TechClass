//! 前端的文件系统

use std::path::PathBuf;

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
    base_path: PathBuf,
    /// 相对于基础路径的路径
    relative_path: PathBuf,
}

impl SafePathBuf {
    /// 创建一个新的安全路径
    pub fn new(id: String, plugin_type: PluginType) -> Result<Self, IpcError> {
        let base_path = get_path(&id, plugin_type)?;
        let base_path = base_path.canonicalize().map_err(IpcError::Io)?; // 确保目录规范

        Ok(Self {
            base_path,
            relative_path: PathBuf::new(),
        })
    }

    /// 获取完整路径
    pub fn to_path_buf(&self) -> PathBuf {
        self.base_path.join(&self.relative_path)
    }

    /// 获取相对路径
    pub fn relative_path(&self) -> &PathBuf {
        &self.relative_path
    }

    /// 获取基础路径
    pub fn base_path(&self) -> &PathBuf {
        &self.base_path
    }

    /// 添加路径组件
    pub fn join<P: AsRef<std::path::Path>>(&self, path: P) -> Result<Self, IpcError> {
        let new_path = self.to_path_buf().join(path);

        // 标准化路径
        let canonical_path = new_path.canonicalize().map_err(IpcError::Io)?;
        let canonical_base = self.base_path.canonicalize().map_err(IpcError::Io)?;

        // 确保新路径仍在基础路径下
        if !canonical_path.starts_with(&canonical_base) {
            return Err(IpcError::PathTraversal);
        }

        // 计算新的相对路径
        let relative_path = canonical_path
            .strip_prefix(&canonical_base)
            .map_err(|_| IpcError::PathTraversal)?
            .to_path_buf();

        Ok(Self {
            base_path: self.base_path.clone(),
            relative_path,
        })
    }
}

pub mod fs_api {
    use super::*;
    use std::fs;

    /// 检查路径状态
    #[tauri::command]
    pub async fn exists(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<FsItemInfo, IpcError> {
        let safe_path = SafePathBuf::new(id, PluginType::from_str(&plugin_type)?)?.join(path)?;
        let path = safe_path.to_path_buf();

        if !path.exists() {
            return Ok(FsItemInfo {
                exists: false,
                is_file: false,
                is_dir: false,
            });
        }

        let metadata = fs::metadata(path).map_err(IpcError::Io)?;

        Ok(FsItemInfo {
            exists: true,
            is_file: metadata.is_file(),
            is_dir: metadata.is_dir(),
        })
    }

    /// 读取文件内容
    #[tauri::command]
    pub async fn read_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<String, IpcError> {
        let safe_path = SafePathBuf::new(id, PluginType::from_str(&plugin_type)?)?.join(path)?;
        fs::read_to_string(safe_path.to_path_buf()).map_err(IpcError::Io)
    }

    /// 写入文件内容
    #[tauri::command]
    pub async fn write_file(
        id: String,
        plugin_type: String,
        path: String,
        content: String,
    ) -> Result<(), IpcError> {
        let safe_path = SafePathBuf::new(id, PluginType::from_str(&plugin_type)?)?.join(path)?;
        fs::write(safe_path.to_path_buf(), content).map_err(IpcError::Io)
    }

    /// 删除文件
    #[tauri::command]
    pub async fn remove_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<(), IpcError> {
        let safe_path = SafePathBuf::new(id, PluginType::from_str(&plugin_type)?)?.join(path)?;
        fs::remove_file(safe_path.to_path_buf()).map_err(IpcError::Io)
    }
}
