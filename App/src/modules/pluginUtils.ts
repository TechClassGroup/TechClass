/**
 * @fileOverview 插件的一些工具函数
 */
import {computed, ComputedRef, markRaw} from "vue";
import {PluginComponentStore} from "../types/plugins";
import {loadedPlugins} from "./pluginsManager.ts";

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
 * 根据插件 ID 获取插件的 API 对象。
 *
 * @param {string} id - 插件的唯一标识符。
 * @returns {Record<string, any> | null} - 返回插件的 API 对象，如果插件不存在或没有 API，则返回 `null`。
 */
export function getPluginApi(id: string): Record<string, any> | null {
    const plugin = loadedPlugins.value[id];
    if (plugin?.pluginObject?.api) {
        return plugin.pluginObject.api;
    }
    return null;
}