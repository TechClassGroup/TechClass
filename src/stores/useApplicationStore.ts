/**
 * @fileOverview 应用程序的一些状态
 */
import {defineStore} from "pinia";
import logger from "@/modules/logger.ts";


export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            setting: {
                open: false,
                current_page: 'about'
            }
        }
    },
    actions: {
        resetSettingCurrentPage() {
            this.setting.current_page = 'about'
        },
        reverseSettingOpen() {
            logger.trace(`设置界面当前状态: ${this.setting.open} 将切换到: ${!this.setting.open}`);
            this.setting.open = !this.setting.open
        }
    }

})