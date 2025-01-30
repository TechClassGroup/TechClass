/**
 * @fileOverview 前后端分享的类型定义
 */

export enum IPCErrorKind {
    Io = "io",
    Json = "json",
    InvalidPluginType = "invalidPluginType",
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
