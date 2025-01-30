/**
 * @fileOverview Rust API
 */
import {FsItemInfo, PluginType} from "../types/rsShared";
import {invoke} from "@tauri-apps/api/core";

export class rustFs {
    static async exists(
        id: string,
        type: PluginType,
        path: string
    ): Promise<FsItemInfo> {
        return invoke("exists", {
            id,
            pluginType: type.toString(),
            path,
        });
    }

    static async readFile(
        id: string,
        type: PluginType,
        path: string
    ): Promise<string> {
        return invoke("read_file", {
            id,
            pluginType: type.toString(),
            path,
        });
    }

    static async writeFile(
        id: string,
        type: PluginType,
        path: string,
        content: string
    ): Promise<void> {
        return invoke("write_file", {
            id,
            pluginType: type.toString(),
            path,
            content,
        });
    }

    static async removeFile(
        id: string,
        type: PluginType,
        path: string
    ): Promise<void> {
        return invoke("remove_file", {
            id,
            pluginType: type.toString(),
            path,
        });
    }

    static async createDir(
        id: string,
        type: PluginType,
        path: string
    ): Promise<void> {
        return invoke("create_dir", {
            id,
            pluginType: type.toString(),
            path,
        });
    }

    static async removeDir(
        id: string,
        type: PluginType,
        path: string
    ): Promise<void> {
        return invoke("remove_dir", {
            id,
            pluginType: type.toString(),
            path,
        });
    }
}
