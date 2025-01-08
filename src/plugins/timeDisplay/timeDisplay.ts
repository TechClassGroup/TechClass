/**
 * @fileOverview 时间显示插件
 */

import timeDisplayMain from "./timeDisplayMain.vue";
import {IPlugin} from "@/types/plugins";

type MainComponentKey = "main";
const timeDisplay: IPlugin<MainComponentKey> = {
    name: "时钟",
    id: "timeDisplay",
    description: "显示当前时间",
    component: {
        mainPage: {
            main: timeDisplayMain,
        },
        settingPage: null,
    },
    init: () => {

    }
}
export default timeDisplay;