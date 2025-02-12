/**
 * @fileOverview 所有的官方插件，按照名称首字母排序
 */
import timeDisplay from "./timeDisplay/timeDisplay";
import {scheduleEditor} from "./scheduleEditor/scheduleEditor";
import {scheduleDisplay} from "./scheduleDisplay/scheduleDisplay";
import {IPlugin} from "../types/plugins";

const plugins: IPlugin<any>[] = [
    scheduleEditor,
    scheduleDisplay,
    timeDisplay,
];

export const officialPlugins = plugins.sort((a, b) => a.name.localeCompare(b.name));
