/**
 * @fileOverview 时间显示插件
 */

import {OfficialPlugin, Plugin, PluginManifest} from "../../core/plugins-systems/types/plugin.type";
import timeDisplayMain from "./timeDisplayMain.vue";


class timeDisplay extends Plugin {
    onload(): Promise<void> | void {
        this.componentStatus.addMainPageComponent("main", timeDisplayMain)
    }

    onunload(): void {
    }

}

const manifest: PluginManifest = {
    name: "时钟",
    description: "显示当前时间",
    id: "timeDisplay",
    minAppVersion: "0.0.0",
    author: "TechClass官方",
    version: "0.0.0"
}
const PluginTimeDisplay: OfficialPlugin = {
    manifest,
    plugin: timeDisplay,
}
export default PluginTimeDisplay