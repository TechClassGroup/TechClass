import {IPlugin, PluginStore} from "../../types/plugins";
import scheduleEditorSetting from "./components/scheduleEditorSetting.vue";
import {clearStore, initializeStore} from "./store/scheduleStore";

type ConfigType = "course" | "enable" | "todayConfig";

interface TabState {
    currentTabs: {
        course?: string;
        enable?: string;
        todayConfig?: string;
    };
    configType: ConfigType;
}

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
        onMounted: (store: PluginStore, api) => {
            initializeStore(store, api.fs);
        },
        onUnmounted: () => {
            clearStore();
        },
    },
    storeConfig: {
        state: (): TabState => {
            return {
                currentTabs: {
                    course: "subject",
                    enable: "enable",
                    todayConfig: "status",
                },
                configType: "course",
            };
        },
        storageConfig: {
            enabled: true,
            keys: ["currentTabs", "configType"],
        },
    },
};
