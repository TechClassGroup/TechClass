/**
 * @fileOverview 应用程序的一些状态
 */
import {defineStore, StoreDefinition} from "pinia";
import logger from "../core/utils/logger";
import {init_plugins} from "../core/plugins-systems/pluginsManager_old";
import {watch} from "vue";

type AppStore = ReturnType<typeof useApplicationStore>;

export const enum Theme {
    dark = "dark",
    light = "light",
    auto = "auto",
}

export interface ApplicationStoreTypes {
    setting: {
        open: boolean;
        current_page: string;
        needReloadPlugins: boolean;
    };
    storage: {
        pluginsList: {
            official: string[];
            custom: string[];
        };
        appearance: {
            theme: Theme;
        };
    };
}

// @ts-ignore
export const useApplicationStore: StoreDefinition = defineStore("AppSettings", {
    state: (): ApplicationStoreTypes => {
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
                appearance: {
                    theme: Theme.auto,
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
                `设置界面当前状态: ${this.setting.open} 将切换到: ${!this
                    .setting.open}`
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
        keys: ["storage"],
        throttle_ms: 1000,
    },
    on_storage_load_complete(store: AppStore) {
        init_plugins();
        watch(
            () => store.storage.pluginsList,
            () => {
                store.setting.needReloadPlugins = true;
            },
            {deep: true}
        );
    },
});
