/**
 * @fileOverview 课表展示器插件
 */
import {IPlugin} from "../../types/plugins.types";


// type mainPageKeys = ""
export const InfoDisplay: IPlugin = {
    name: "作业展示器",
    description: "",
    id: "InfoDisplay",
    isOfficial: true,
    component: {
        mainPage: {},
        settingPage: null,
    },
    hooks: {},
    storeConfig: {}
};
