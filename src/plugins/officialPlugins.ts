/**
 * @fileOverview 所有的官方插件，按照名称首字母排序
 */
import timeDisplay from "@/plugins/timeDisplay/timeDisplay.ts";
import { scheduleEditor } from "@/plugins/scheduleEditor/scheduleEditor.ts";

// 按照插件名称排序（编译时静态排序）
const plugins = [
    scheduleEditor, // "课表编辑器"
    timeDisplay, // "时钟"
];

export const officialPlugins = plugins.sort((a, b) => a.name.localeCompare(b.name));
