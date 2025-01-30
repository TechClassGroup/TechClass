/// 一些错误

#[derive(Debug, thiserror::Error)]
pub enum IpcError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error("无效的插件类型: {0}")]
    InvalidPluginType(String),
    #[error("不允许的路径: {0}")]
    PathPermissionDenied(String),
    #[error("目标不是文件")]
    NotFile,
    #[error("目标不是目录")]
    NotDir,
    #[error("目标是目录")]
    IsDir,
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
pub enum IpcErrorKind {
    Io(String),
    Json(String),
    InvalidPluginType(String),
    PathPermissionDenied(String),
    NotFile(String),
    NotDir(String),
    IsDir(String),
}

impl serde::Serialize for IpcError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error_message = self.to_string();
        let error_kind = match self {
            Self::Io(_) => IpcErrorKind::Io(error_message),
            Self::Json(_) => IpcErrorKind::Json(error_message),
            Self::InvalidPluginType(_) => IpcErrorKind::InvalidPluginType(error_message),
            Self::PathPermissionDenied(_) => IpcErrorKind::PathPermissionDenied(error_message),
            Self::NotFile => IpcErrorKind::NotFile(error_message),
            Self::NotDir => IpcErrorKind::NotDir(error_message),
            Self::IsDir => IpcErrorKind::IsDir(error_message),
        };
        error_kind.serialize(serializer)
    }
}
