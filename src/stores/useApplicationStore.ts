/**
 * @fileOverview 应用程序的一些状态
 */
import {defineStore, StoreDefinition} from "pinia";
import logger from "@/modules/logger.ts";

export const useApplicationStore: StoreDefinition = defineStore("AppSettings", {
    state: () => {
        return {
            setting: {
                open: false,
                current_page: "about",
            },
            storage: {
                open: false,
            },
            simple_num: 0,
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
            this.storage.open = this.setting.open
        },
    },
    config_storage: {
        enabled: true,
        key: 'storage',
    },
});
