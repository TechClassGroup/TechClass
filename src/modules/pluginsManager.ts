/**
 * @fileOverview 插件管理器
 */

import logger from "./logger.ts";
import { defineStore } from "pinia";
import { markRaw, ref, Ref, watch } from "vue";
import {
    DraggableComponentStatus,
    InstancePlugin,
    IPlugin,
} from "@/types/plugins";
import { useApplicationStore } from "@/stores/useApplicationStore.ts";
import { official_plugins } from "@/plugins/official_plugins.ts";

export const loadedPlugins: Ref<{ [key: string]: InstancePlugin }> = ref({});

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
    // 从插件中提取组件
    const { mainPage, settingPage } = plugin.component ?? {};

    // 包裹组件防止被reactive包裹，然后vue在那叫个不停
    const processedPlugin = { ...plugin };
    processedPlugin.component = {
        // 处理主页面组件:
        // 1. 如果存在主页面组件,使用 markRaw 包装每个组件防止 Vue 响应式处理
        // 2. 如果不存在则为 null
        mainPage: mainPage 
            ? Object.fromEntries(
                Object.entries(mainPage).map(([key, component]) => [
                    key,
                    markRaw(component)
                ])
            )
            : mainPage,
        
        // 处理设置页面组件:
        // 如果存在则用 markRaw 包装,否则保持原值
        settingPage: settingPage ? markRaw(settingPage) : settingPage
    };

    // 初始化 store
    const userState = processedPlugin.storeConfig?.state;
    const userActions = processedPlugin.storeConfig?.actions;
    const userGetters = processedPlugin.storeConfig?.getters;
    const isOfficial = processedPlugin.isOfficial;
    const storeDefine = defineStore(plugin.id, {
        state: () => ({
            componentStatus: {} as Record<
                ComponentKeys,
                DraggableComponentStatus
            >,
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
        },
        ...(isOfficial && plugin.storeConfig?.storageConfig
            ? {
                  config_storage: {
                      enabled: plugin.storeConfig.storageConfig.enabled,
                      keys: plugin.storeConfig.storageConfig.keys,
                      throttle_ms: plugin.storeConfig.storageConfig.throttle_ms,
                      max_retries: plugin.storeConfig.storageConfig.max_retries,
                  },
              }
            : {}),
    });
    const store = storeDefine();

    // 自动同步组件状态
    watch(
        () => Object.keys(processedPlugin.component.mainPage || {}),
        () => {
            store.updateComponentStatus();
        },
        {
            immediate: true,
        }
    );
    // 存入插件列表
    loadedPlugins.value[plugin.id] = {
        pluginObject: processedPlugin,
        store,
    };
    logger.info(`插件 ${plugin.name} id: ${plugin.id} 加载成功`);
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
