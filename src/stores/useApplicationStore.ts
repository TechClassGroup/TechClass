/**
 * @fileOverview 应用程序的一些状态
 */
import {defineStore, StoreDefinition} from "pinia";
import logger from "@/modules/logger.ts";
import {init_plugins} from "@/modules/plugins_manager.ts";
import {watch} from "vue";

type AppStore = ReturnType<typeof useApplicationStore>

export const useApplicationStore: StoreDefinition = defineStore("AppSettings", {
    state: () => {
        return {
            setting: {
                open: false,
                current_page: "about",
                needReloadPlugins: false,
            },
            storage: {
                pluginsList: {
                    official: [] as string[],
                    custom: [] as string[],
                },
            },
        };
    },
    actions: {
        resetSettingCurrentPage() {
            this.setting.current_page = "about";
        },
        reverseSettingOpen() {
            logger.trace(
                `设置界面当前状态: ${this.setting.open} 将切换到: ${!this.setting.open}`
            );
            this.setting.open = !this.setting.open;
        },
        reloadPlugins() {
            init_plugins();
            this.setting.needReloadPlugins = false;
        },

    },

    config_storage: {
        enabled: true,
        key: "storage",
        throttle_ms: 1000,
    },
    on_storage_load_complete(store: AppStore) {
        init_plugins();
        watch(
            () => (store).storage.pluginsList,
            () => {
                (store).setting.needReloadPlugins = true;
            },
            {deep: true}
        );
    },
});
