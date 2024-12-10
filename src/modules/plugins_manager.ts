/**
 * @fileOverview 插件管理器
 */


import logger from "./logger.ts";
import {defineStore} from "pinia";
import {computed, ComputedRef, Ref, ref} from "vue";
import {InstancePlugin, IPlugin, PluginComponentStore} from "../types/plugins.d.ts";


const loadedPlugins: Ref<{ [key: string]: InstancePlugin }> = ref({});
/**
 * 得到已加载插件的组件以及其store的联合体
 */
export const computedPluginsComponent:
    ComputedRef<Array<PluginComponentStore>> =
    computed(() => {
        const components: Array<PluginComponentStore> = [];
        for (const plugin of Object.values(loadedPlugins.value)) {
            components.push({
                component: plugin.pluginObject.component,
                store: plugin.store,
                id: plugin.pluginObject.id
            })
        }
        return components;
    })

/**
 * 加载插件
 * @param plugin
 */
export function loadNewPlugin(plugin: IPlugin) {
    logger.trace(`加载插件 ${plugin.name} id: ${plugin.id}`);
    if (loadedPlugins.value[plugin.id]) {
        logger.warn(`插件 ${plugin.name} id: ${plugin.id} 已加载`);
        return;
    }
    const store = defineStore(plugin.id, {})();
    plugin.init(store);
    loadedPlugins.value[plugin.id] = {
        pluginObject: plugin,
        store
    }
    logger.info(`插件 ${plugin.name} id: ${plugin.id} 加载成功`);

}
