/**
 * @fileOverview 插件的文件系统API
 */
import {rustLocalFs} from "../../rustApi";
import {FsItemInfo, PluginType} from "../../../types/rsShared.types";

/**
 * 局部文件系统的API 以你的插件文件夹作为原点
 */
export class localFileSystem {
    /**
     * 插件的ID
     */
    private readonly pluginId: string;
    /**
     * 是否是官方插件
     * - 如果为真，则会创建到config目录下
     * - 否则，将会创建到插件目录下
     * - 如果你正在开发第三方插件，请将其设置为false
     */
    private readonly isOfficial: boolean;

    constructor(pluginId: string, isOfficial: boolean) {
        this.pluginId = pluginId;
        this.isOfficial = isOfficial;
    }

    /**
     * 检查文件或目录是否存在
     * @param path 相对路径
     * @returns 文件信息
     */
    async exists(path: string): Promise<FsItemInfo> {
        const pluginType = this.isOfficial
            ? PluginType.Official
            : PluginType.Custom;
        return rustLocalFs.exists(this.pluginId, pluginType, path);
    }

    /**
     * 读取文件内容
     * @param path 相对路径
     * @returns 文件内容
     */
    async readFile(path: string): Promise<string> {
        const pluginType = this.isOfficial
            ? PluginType.Official
            : PluginType.Custom;
        return rustLocalFs.readFile(this.pluginId, pluginType, path);
    }

    /**
     * 写入文件内容
     * @param path 相对路径
     * @param content 文件内容
     */
    async writeFile(path: string, content: string): Promise<void> {
        const pluginType = this.isOfficial
            ? PluginType.Official
            : PluginType.Custom;
        return rustLocalFs.writeFile(this.pluginId, pluginType, path, content);
    }

    /**
     * 删除文件
     * @param path 相对路径
     */
    async removeFile(path: string): Promise<void> {
        const pluginType = this.isOfficial
            ? PluginType.Official
            : PluginType.Custom;
        return rustLocalFs.removeFile(this.pluginId, pluginType, path);
    }

    /**
     * 创建目录
     * @param path 相对路径
     */
    async createDir(path: string): Promise<void> {
        const pluginType = this.isOfficial
            ? PluginType.Official
            : PluginType.Custom;
        return rustLocalFs.createDir(this.pluginId, pluginType, path);
    }

    /**
     * 删除目录
     * @param path 相对路径
     */
    async removeDir(path: string): Promise<void> {
        const pluginType = this.isOfficial
            ? PluginType.Official
            : PluginType.Custom;
        return rustLocalFs.removeDir(this.pluginId, pluginType, path);
    }
}

