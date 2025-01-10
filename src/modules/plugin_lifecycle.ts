import {loadedPlugins} from "@/modules/plugins_manager.ts";

/**
 * @fileOverview 管理插件的生命周期
 */
export function onPluginRegister(id: string, callback: Function) {
    if (loadedPlugins.value[id]) {
        callback();
    }

}