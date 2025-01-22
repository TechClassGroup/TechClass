import { IPlugin } from "@/types/plugins";
import scheduleEditorSetting from "@/plugins/scheduleEditor/scheduleEditorComponents/scheduleEditorSetting.vue";
import { initializeStore, clearStore } from "./scheduleStore.ts";

/**
 * @fileOverview 课表编辑器插件
 */
export const scheduleEditor: IPlugin = {
    name: "课表编辑器",
    description: "",
    id: "scheduleEditor",
    isOfficial: true,
    component: {
        mainPage: null,
        settingPage: scheduleEditorSetting,
    },
    hooks: {
        onMounted: () => {
            initializeStore();
        },
        onUnmounted: () => {
            clearStore();
        },
    },
};
