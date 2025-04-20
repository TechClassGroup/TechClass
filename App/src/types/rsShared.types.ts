/**
 * @fileOverview 前后端分享的类型定义
 */

export const enum IpcErrorKind {
    Io = "Io",
    Json = "Json",
    InvalidPluginType = "InvalidPluginType",
    NotFile = "NotFile",
    NotDir = "NotDir",
    IsDir = "IsDir",
}

export interface IpcError {
    kind: IpcErrorKind;
    message: string;
}


export const enum PluginType {
    Official = "official",
    Custom = "custom",
}

export interface FsItemInfo {
    exists: boolean;
    is_file: boolean;
    is_dir: boolean;
}
