/**
 * @fileOverview 课表展示器插件
 */
import {OfficialPlugin, Plugin, PluginManifest,} from "../../core/plugins-systems/types/plugin.type";

// // type mainPageKeys = ""
// export const InfoDisplay: IPlugin = {
//     name: "作业展示器",
//     description: "",
//     id: "InfoDisplay",
//     isOfficial: true,
//     component: {
//         mainPage: {},
//         settingPage: null,
//     },
//     hooks: {},
//     storeConfig: {}
// };


class InfoDisplay extends Plugin {
    onload(): Promise<void> | void {
        return undefined;
    }

    onunload(): void {
    }

}

const manifest: PluginManifest = {
    name: "作业展示器",
    description: "展示作业信息",
    id: "InfoDisplay",
    minAppVersion: "0.0.0",
    author: "TechClass官方",
    version: "0.0.0",
}

const PluginInfoDisplay: OfficialPlugin = {
    manifest,
    plugin: InfoDisplay,
}
export default PluginInfoDisplay;
