/// 一些错误

#[derive(Debug, thiserror::Error)]
pub enum IpcError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error("无效的插件类型")]
    InvalidPluginType,
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
pub enum IpcErrorKind {
    Io(String),
    Json(String),
    InvalidPluginType(String),
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
            Self::InvalidPluginType => IpcErrorKind::InvalidPluginType(error_message),
        };
        error_kind.serialize(serializer)
    }
}
