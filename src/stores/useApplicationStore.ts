/**
 * @fileOverview 应用程序的一些状态
 */
import {defineStore} from "pinia";

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
            this.setting.open = !this.setting.open
        }
    }

})