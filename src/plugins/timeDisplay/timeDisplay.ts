/**
 * @fileOverview 时间显示插件
 */
import {PluginObject} from "../../types/type.ts";
import timeDisplayMain from "./timeDisplayMain.vue";

const timeDisplay: PluginObject = {
    create: () => {
        return {
            name: "时钟",
            id: "timeDisplay",
            description: "显示当前时间",
            setting_page: null,
            main_page: timeDisplayMain,
            official: true
        }
    },
    init: () => {

    }
}
export default timeDisplay;