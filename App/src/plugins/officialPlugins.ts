/**
 * @fileOverview 所有的官方插件，按照名称首字母排序
 */
import timeDisplay from "./timeDisplay/timeDisplay.ts";
import {scheduleEditor} from "./scheduleEditor/scheduleEditor.ts";

const plugins = [
    scheduleEditor,
    timeDisplay,
];

export const officialPlugins = plugins.sort((a, b) => a.name.localeCompare(b.name));
