/**
 * @fileOverview 前后端分享的类型定义
 */

export enum IpcErrorKind {
    Io = "Io",
    Json = "Json",
    InvalidPluginType = "InvalidPluginType",
    PathTraversal = "PathTraversal",
    NotFile = "NotFile",
    NotDir = "NotDir",
}

export interface IpcError {
    kind: IpcErrorKind;
    message: string;
}


export enum PluginType {
    Official = "official",
    Custom = "custom",
}

export interface FsItemInfo {
    exists: boolean;
    is_file: boolean;
    is_dir: boolean;
}
