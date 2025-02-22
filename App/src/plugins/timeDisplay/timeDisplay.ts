/**
 * @fileOverview 时间显示插件
 */

import timeDisplayMain from "./timeDisplayMain.vue";
import {IPlugin} from "../../types/plugins.types";
import timeDisplaySetting from "./timeDisplaySetting.vue";

type MainComponentKey = "main";
const timeDisplay: IPlugin<MainComponentKey> = {
    name: "时钟",
    id: "timeDisplay",
    description: "显示当前时间",
    isOfficial: true,
    component: {
        mainPage: {
            main: timeDisplayMain,
        },
        settingPage: timeDisplaySetting,
    },
    storeConfig: {
        state: () => {
            return {
                storage: {
                    displayHour: true,
                    displayMinute: true,
                    displaySecond: true,
                },
            };
        },
        storageConfig: {
            enabled: true,
            throttle_ms: 1000,
            keys: ["componentStatus", "storage"],
        },
    },
};
export default timeDisplay;
