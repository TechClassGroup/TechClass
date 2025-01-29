//! 前端的文件系统

use std::path::PathBuf;

use crate::{contestants::PATH_BASIC, error::IpcError};
use lazy_static::lazy_static;

/// 插件类型
pub enum PluginType {
    Official,
    Custom,
}
impl PluginType {
    pub fn from_str(s: &str) -> Result<Self, IpcError> {
        match s {
            "official" => Ok(Self::Official),
            "custom" => Ok(Self::Custom),
            _ => Err(IpcError::InvalidPluginType),
        }
    }
}

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
    pub fn new(id: String, plugin_type: PluginType, path: PathBuf) -> Result<Self, IpcError> {
        let base_path = get_path(&id, plugin_type)?;

        // 标准化路径（移除 . 和 ..）
        let canonical_path = path.canonicalize().map_err(IpcError::Io)?;
        let canonical_base = base_path.canonicalize().map_err(IpcError::Io)?;

        // 确保路径在基础路径下
        if !canonical_path.starts_with(&canonical_base) {
            return Err(IpcError::PathTraversal);
        }

        // 计算相对路径
        let relative_path = canonical_path
            .strip_prefix(&canonical_base)
            .map_err(|_| IpcError::PathTraversal)?
            .to_path_buf();

        Ok(Self {
            base_path,
            relative_path,
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
