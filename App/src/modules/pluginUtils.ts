/**
 * @fileOverview 插件的一些工具函数
 */
import {computed, ComputedRef} from "vue";
import {IPlugin, PluginComponentStore} from "../types/plugins";
import {loadedPlugins, onPluginRegister} from "./pluginsManager";
import {FsItemInfo, PluginType} from "../types/rsShared";
import {rustFs} from "./rustApi";

export const computedPluginsComponent: ComputedRef<
    Array<PluginComponentStore>
> = computed(() => {
    const components: Array<PluginComponentStore> = [];
    for (const plugin of Object.values(loadedPlugins.value)) {
        components.push({
            component: plugin.pluginObject.component,
            store: plugin.store,
            id: plugin.pluginObject.id,
            isOfficial: plugin.pluginObject.isOfficial,
            name: plugin.pluginObject.name,
        });
    }
    return components;
});


/**
 * 插件文件系统操作类
 */
export class PluginFs {
    id: string;
    pluginType: PluginType;

    constructor(plugin: IPlugin) {
        this.id = plugin.id;
        if (plugin.isOfficial) {
            this.pluginType = PluginType.Official;
        } else {
            this.pluginType = PluginType.Custom;
        }
    }

    async exists(path: string): Promise<FsItemInfo> {
        return rustFs.exists(this.id, this.pluginType, path);
    }

    async readFile(path: string): Promise<string> {
        return rustFs.readFile(this.id, this.pluginType, path);
    }

    async writeFile(path: string, content: string): Promise<void> {
        return rustFs.writeFile(this.id, this.pluginType, path, content);
    }

    async removeFile(path: string): Promise<void> {
        return rustFs.removeFile(this.id, this.pluginType, path);
    }

    async createDir(path: string): Promise<void> {
        return rustFs.createDir(this.id, this.pluginType, path);
    }

    async removeDir(path: string): Promise<void> {
        return rustFs.removeDir(this.id, this.pluginType, path);
    }
}

/**
 * 插件间的API
 */
export class InterPluginApi {
    /**
     * 根据插件 ID 获取插件的 API 对象。
     *
     * @param {string} id - 插件的唯一标识符。
     * @returns {Record<string, any> | null} - 返回插件的 API 对象，如果插件不存在或没有 API，则返回 `null`。
     */
    static getPluginApi(id: string): Record<string, any> | null {
        const plugin = loadedPlugins.value[id];
        if (plugin?.pluginObject?.api) {
            return plugin.pluginObject.api;
        }
        return null;
    }

    /**
     * 根据插件 ID 获取插件的 API 对象。
     * 如果插件未加载，则等待插件加载完成后再返回 API 对象。
     * 如果插件不存在或没有 API，则返回 `null`。
     * @param id - 插件的唯一标识符。
     */
    static getPluginApiPromise(id: string): Promise<Record<string, any> | null> {
        return new Promise((resolve) => {
            const plugin = loadedPlugins.value[id];
            if (plugin) {
                if (plugin?.pluginObject?.api) {
                    resolve(plugin.pluginObject.api)
                } else {
                    resolve(null)
                }
            } else {
                onPluginRegister(id, () => {
                    const plugin = loadedPlugins.value[id];
                    if (plugin?.pluginObject?.api) {
                        resolve(plugin.pluginObject.api)
                    } else {
                        resolve(null)
                    }
                })
            }


        });
    }
}