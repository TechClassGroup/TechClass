/**
 * @fileOverview 插件管理器
 */
import {ref, Ref} from "vue";
import {App, OfficialPlugin, Plugin, PluginManifest} from "./plugin.type";
import {createLogger} from "../utils/utils";
import {useApplicationStore} from "../../stores/useApplicationStore";
import officialPlugins from "./officialPlugins";


const loadedPlugins: Ref<Record<string, Plugin>> = ref({});
const logger = new createLogger("PluginManager");

function registerPlugin(
    pluginClass: Plugin,
    manifest: PluginManifest
) {
    const app: App = undefined; // TODO: Provide a valid App instance here instead of null

    logger.trace(`加载插件 ${manifest.name} id: ${manifest.id}`);
    // 处理已加载插件的情况
    if (loadedPlugins.value[manifest.id]) {
        logger.warn(`插件 ${manifest.name} id: ${manifest.id} 已加载`);
        return;
    }
    // @ts-ignore
    const plugin = new pluginClass(app, manifest);
    loadedPlugins.value[manifest.id] = plugin;
    logger.debug(
        `已创建插件实例 ${manifest.name} id: ${manifest.id} 实例: ${plugin}`
    );

    plugin.onload();

    logger.info(`插件 ${manifest.name} id: ${manifest.id} 加载完成`);
}

function registerOfficialPlugin(plugin: OfficialPlugin) {
    const manifest = plugin.manifest
    const pluginClass = plugin.plugin;
    logger.debug(`注册官方插件 ${manifest.name} id: ${manifest.id}`);
    registerPlugin(pluginClass, manifest)
}

function unRegisterPlugin(pluginId: string) {
    const plugin: Plugin | undefined = loadedPlugins.value[pluginId];
    if (!plugin) {
        logger.warn(`插件 ${pluginId} 未加载 无法卸载`);
        return;
    }
    logger.trace(`开始卸载插件 ${pluginId}`);
    plugin.onunload();
    delete loadedPlugins.value[pluginId];
    logger.info(`插件 ${pluginId} 卸载完成`);
}

function updatePluginList() {
    logger.debug("开始更新插件列表");
    const appStore = useApplicationStore();
    const enabledOfficialPlugins: string[] =
        appStore.storage.pluginsList.official;
    const currentPluginsId = Object.keys(loadedPlugins.value);

    // 遍历当前已加载的插件，卸载不在启用列表中的插件
    logger.trace("检查需要卸载的插件...");
    currentPluginsId.forEach((id) => {
        if (!enabledOfficialPlugins.includes(id)) {
            logger.debug(`插件 ${id} 不在启用列表中，准备卸载`);
            unRegisterPlugin(id);
        }
    });

    // 遍历启用的插件列表，加载尚未加载的插件
    logger.trace("检查需要加载的新插件");
    enabledOfficialPlugins.forEach((pluginId) => {
        // 如果插件已加载，则跳过
        if (loadedPlugins.value[pluginId]) {
            logger.trace(`插件 ${pluginId} 已加载，跳过加载`);
            return;
        }

        // 从官方插件列表中查找插件定义
        logger.trace(`尝试查找官方插件 ${pluginId}`);
        const plugin = officialPlugins.find((p) => p.manifest.id === pluginId);
        if (plugin) {
            logger.debug(`找到官方插件 ${pluginId}，准备注册`);
            registerOfficialPlugin(plugin);
            return;
        }

        // 如果在官方插件列表中未找到，则从启用列表中移除 (可能表示配置错误或插件已移除，但是并不是通过官方手段)
        logger.warn(
            `在官方插件列表中未找到插件 ID: ${pluginId}，将从启用列表中移除`
        );
        const index = enabledOfficialPlugins.indexOf(pluginId);
        if (index > -1) {
            enabledOfficialPlugins.splice(index, 1);
            logger.warn(
                `已将无效插件 ID ${pluginId} 从本次处理的启用列表中移除`
            );
        }
    });
    logger.debug("插件列表更新完成");
}
