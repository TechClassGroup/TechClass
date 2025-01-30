//! @fileOverview 前后端共享的类型定义

use crate::error::IpcError;
use serde::Serialize;

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
            _ => Err(IpcError::InvalidPluginType(s.to_string())),
        }
    }
}
/// 文件系统信息
#[derive(Serialize)]
pub struct FsItemInfo {
    pub exists: bool,
    pub is_file: bool,
    pub is_dir: bool,
}
