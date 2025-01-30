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
    fn create_safe_path(id: &str, plugin_type: &str, path: &str) -> Result<SafePathBuf, IpcError> {
        let plugin_type_enum = PluginType::from_str(plugin_type)?;
        let base = get_path(id, plugin_type_enum)?;
        let base = base.canonicalize()?;
        debug!(
            "创建安全路径 - ID: {}, 类型: {}, 路径: {}",
            id, plugin_type, path
        );
        let mut safe_path = SafePathBuf {
            base: Arc::new(base.clone()),
            relative: PathBuf::new(),
        };

        if !path.is_empty() {
            let target_path = base.join(path);
            // 检查目标路径是否在基础路径下
            if let Ok(canonical_path) = target_path.canonicalize() {
                if !canonical_path.starts_with(&base) {
                    warn!("检测到路径遍历尝试 - ID: {}, 路径: {}", id, path);
                    return Err(IpcError::PathPermissionDenied(
                        "Path traversal detected".to_string(),
                    ));
                }
                safe_path.relative = path.into();
            } else {
                // 如果路径不存在，仍然进行安全检查
                let normalized_path = target_path.components().collect::<PathBuf>();
                if !normalized_path.starts_with(&base) {
                    warn!("检测到路径遍历尝试 - ID: {}, 路径: {}", id, path);
                    return Err(IpcError::PathPermissionDenied(
                        "Path traversal detected".to_string(),
                    ));
                }
                safe_path.relative = path.into();
            }
        }
        Ok(safe_path)
    }

    /// 检查路径状态
    #[tauri::command]
    pub async fn exists(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<FsItemInfo, IpcError> {
        let safe_path: PathBuf = create_safe_path(&id, &plugin_type, &path)?.into();
        debug!("检查路径状态 - ID: {}, 路径: {}", id, path);

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
        let safe_path: PathBuf = create_safe_path(&id, &plugin_type, &path)?.into();
        if !safe_path.is_file() {
            warn!("尝试读取非文件 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::NotFile);
        }
        debug!("读取文件 - ID: {}, 路径: {}", id, path);
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
        let safe_path: PathBuf = create_safe_path(&id, &plugin_type, &path)?.into();
        if safe_path.is_dir() {
            warn!("尝试写入到目录 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::IsDir);
        }
        if let Some(parent) = safe_path.parent() {
            debug!("创建父目录 - ID: {}, 路径: {:?}", id, parent);
            fs::create_dir_all(parent).map_err(IpcError::Io)?;
        }
        debug!("写入文件 - ID: {}, 路径: {}", id, path);
        fs::write(safe_path, content).map_err(IpcError::Io)
    }

    /// 删除文件
    #[tauri::command]
    pub async fn remove_file(
        id: String,
        plugin_type: String,
        path: String,
    ) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(&id, &plugin_type, &path)?.into();
        if !safe_path.is_file() {
            warn!("尝试删除非文件 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::NotFile);
        }
        info!("删除文件 - ID: {}, 路径: {}", id, path);
        fs::remove_file(safe_path).map_err(IpcError::Io)
    }

    /// 创建目录 (递归)
    #[tauri::command]
    pub async fn create_dir(id: String, plugin_type: String, path: String) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(&id, &plugin_type, &path)?.into();
        info!("创建目录 - ID: {}, 路径: {}", id, path);
        fs::create_dir_all(safe_path).map_err(IpcError::Io)
    }

    /// 删除目录 (递归)
    #[tauri::command]
    pub async fn remove_dir(id: String, plugin_type: String, path: String) -> Result<(), IpcError> {
        let safe_path: PathBuf = create_safe_path(&id, &plugin_type, &path)?.into();
        if !safe_path.is_dir() {
            warn!("尝试删除非目录 - ID: {}, 路径: {}", id, path);
            return Err(IpcError::NotDir);
        }
        info!("删除目录 - ID: {}, 路径: {}", id, path);
        fs::remove_dir_all(safe_path).map_err(IpcError::Io)
    }
}
