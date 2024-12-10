/**
 * @fileOverview 时间显示插件
 */

import timeDisplayMain from "./timeDisplayMain.vue";
import {IPlugin} from "@/types/plugins";

const timeDisplay: IPlugin = {
    name: "时钟",
    id: "timeDisplay",
    description: "显示当前时间",
    component: {
        main_page: timeDisplayMain,
        setting_page: null,
    },
    init: () => {

    }
}
export default timeDisplay;