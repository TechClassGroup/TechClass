/**
 * @fileOverview 插件管理器
 */

import logger from "./logger.ts";
import {defineStore} from "pinia";
import {computed, ComputedRef, markRaw, ref, Ref} from "vue";
import {InstancePlugin, IPlugin, PluginComponentStore} from "@/types/plugins";
import {useApplicationStore} from "@/stores/useApplicationStore.ts";
import {official_plugins} from "@/plugins/official_plugins.ts";

const loadedPlugins: Ref<{ [key: string]: InstancePlugin }> = ref({});
/**
 * 得到已加载插件的组件以及其store的联合体
 */
export const computedPluginsComponent: ComputedRef<
    Array<PluginComponentStore>
> = computed(() => {
    const components: Array<PluginComponentStore> = [];
    for (const plugin of Object.values(loadedPlugins.value)) {
        components.push({
            component: plugin.pluginObject.component,
            store: plugin.store,
            id: plugin.pluginObject.id,
        });
    }
    return components;
});

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
    // 使用 markRaw 包裹组件，防止被 reactive 包裹
    if (plugin.component.mainPage) {
        Object.keys(plugin.component.mainPage).forEach((key) => {
            if (plugin.component.mainPage?.key) {
                plugin.component.mainPage[key] = markRaw(
                    plugin.component.mainPage[key]
                );
            }
        });
    }

    const store = defineStore(plugin.id, {})();
    plugin.init(store);
    loadedPlugins.value[plugin.id] = {
        pluginObject: plugin,
        store,
    };
    logger.info(`插件 ${plugin.name} id: ${plugin.id} 加载成功`);
}

/**
 * 卸载插件
 * @param id 插件的ID
 */
export function unloadPlugin(id: string) {
    if (!loadedPlugins.value[id]) {
        logger.warn(`插件 id: ${id} 不存在`);
        return;
    }
    logger.trace(`卸载插件 id: ${id}`);
    delete loadedPlugins.value[id];
    logger.info(`插件 id: ${id} 卸载成功`);
}

/**
 * 初始化插件
 */
export function init_plugins() {
    loadedPlugins.value = {}; // 重置插件列表
    const store = useApplicationStore();
    const enable_official_plugins = store.storage.pluginsList.official;
    const enable_custom_plugins = store.storage.pluginsList.custom;
    for (const plugin of enable_official_plugins) {
        const pluginObject = official_plugins.find((p) => p.id === plugin);
        if (pluginObject) loadNewPlugin(pluginObject);
        else {
            logger.warn(`官方插件 ${plugin} 不存在 加载失败`);
            // 移除不存在的插件
            enable_official_plugins.splice(
                enable_official_plugins.indexOf(plugin),
                1
            );
        }
    }

    store.setting.needReloadPlugins = false; // 回调防止循环调用
}
