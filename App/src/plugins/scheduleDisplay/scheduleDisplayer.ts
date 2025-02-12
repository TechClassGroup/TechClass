/**
 * @fileOverview 课表展示器插件
 */
import {IPlugin} from "../../types/plugins";


export const scheduleDisplay: IPlugin = {
    name: "课表展示器",
    description: "",
    id: "scheduleDisplay",
    isOfficial: true,
    component: {
        mainPage: null,
        settingPage: null
    },
    hooks: {},
}