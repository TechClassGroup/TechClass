import {defineStore} from "pinia";

/**
 * @fileOverview 应用程序的一些状态
 */
export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            setting: {
                open: false,
                current_page: 'general/about'
            }
        }
    },
    actions: {
        resetSettingCurrentPage() {
            this.setting.current_page = 'general/about'
        }
    }

})