/**
 * @fileOverview 插件管理器
 */

import logger from "./logger.ts";
import {defineStore} from "pinia";
import {markRaw, ref, Ref, watch} from "vue";
import {DraggableComponentStatus, InstancePlugin, IPlugin,} from "@/types/plugins";
import {useApplicationStore} from "@/stores/useApplicationStore.ts";
import {official_plugins} from "@/plugins/official_plugins.ts";

export const loadedPlugins: Ref<{ [key: string]: InstancePlugin }> = ref({});

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

/**
 * 加载插件
 * @param plugin
 */
export function registerPlugin(plugin: IPlugin<any>) {
    type ComponentKeys = keyof NonNullable<typeof plugin.component.mainPage>;
    logger.trace(`加载插件 ${plugin.name} id: ${plugin.id}`);
    if (loadedPlugins.value[plugin.id]) {
        logger.warn(`插件 ${plugin.name} id: ${plugin.id} 已加载`);
        return;
    }
    // 使用 markRaw 包裹组件，防止被 reactive 包裹
    const mainPage = plugin.component?.mainPage;
    if (mainPage) {
        plugin.component.mainPage = Object.fromEntries(
            Object.entries(mainPage).map(([key, component]) => [
                key,
                markRaw(component),
            ])
        );
    }
    // 初始化 store
    const userState = plugin.storeConfig?.state;
    const userActions = plugin.storeConfig?.actions;
    const userGetters = plugin.storeConfig?.getters;
    const storeDefine = defineStore(plugin.id, {
        state: () => ({
            componentStatus: {} as Record<ComponentKeys, DraggableComponentStatus>,
            ...(userState ? userState() : {}), // 合并用户自定义的 state
        }),
        actions: {
            /**
             * 更新组件的拖动状态
             */
            updateComponentStatus() {
                logger.debug(`更新${plugin.name}的组件状态`);

                for (const key in plugin.component.mainPage) {
                    if (!this.componentStatus[key]) {
                        // 组件的默认值
                        this.componentStatus[key] = {
                            maxHeight: Infinity,
                            maxWidth: Infinity,
                            minHeight: 0,
                            minWidth: 0,
                            width: "auto",
                            height: "auto",
                            x: 0,
                            y: 0,
                            draggable: true,
                            resizable: true,
                            zIndex: 0,
                        };
                    }
                }
                for (const key in this.componentStatus) {
                    if (!plugin.component.mainPage?.[key]) {
                        delete this.componentStatus[key];
                    }
                }
            },
            ...(userActions || {}), // 合并用户自定义的 actions
        },
        getters: {
            ...(userGetters || {}), // 合并用户自定义的 getters
        }
    });
    const store = storeDefine();

    // 自动同步组件状态
    watch(
        () => Object.keys(plugin.component.mainPage || {}),
        () => {
            store.updateComponentStatus();
        },
        {
            immediate: true,
        }
    );
    // 存入插件列表
    loadedPlugins.value[plugin.id] = {
        pluginObject: plugin,
        store,
    };
    logger.info(`插件 ${plugin.name} id: ${plugin.id} 加载成功`);
    console.log(loadedPlugins.value);
    callPluginRegisterCallbacks(plugin.id);
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
        if (pluginObject) registerPlugin(pluginObject);
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

const pluginRegisterCallbacks: Record<string, Function[]> = {};

export function onPluginRegister(id: string, callback: Function) {
    if (loadedPlugins.value[id]) {
        callback();
    }
    if (!pluginRegisterCallbacks[id]) {
        pluginRegisterCallbacks[id] = [];
    }
    pluginRegisterCallbacks[id].push(callback);
}

function callPluginRegisterCallbacks(id: string) {
    if (pluginRegisterCallbacks[id]) {
        for (const callback of pluginRegisterCallbacks[id]) {
            callback();
        }
        delete pluginRegisterCallbacks[id];
    }
}
