/**
 * @fileOverview 时间显示插件
 */

import {type OfficialPlugin, Plugin, type PluginManifest,} from "@/core/plugins-systems/types/plugin.type.ts";
import timeDisplayMain from "./timeDisplayMain.vue";
import timeDisplaySetting from "./timeDisplaySetting.vue";
import type {componentProps} from "@/core/plugins-systems/types/components/utils.ts";

/**
 * 时钟插件的配置类型
 */
interface TimeDisplayConfig {
    /** 是否显示小时 */
    displayHour: boolean;
    /** 是否显示分钟 */
    displayMinute: boolean;
    /** 是否显示秒数 */
    displaySecond: boolean;
}

/**
 * 时钟插件实现类
 * 使用TimeDisplayConfig作为存储数据类型
 */
class timeDisplay extends Plugin<TimeDisplayConfig> {
    onload(): Promise<void> | void {
        this.componentStatus.addMainPageComponent("main", timeDisplayMain, true);
        this.componentStatus.setSettingPageComponent(timeDisplaySetting);

        this.initStorage(
            (): TimeDisplayConfig => {
                return {
                    displayHour: true,
                    displayMinute: true,
                    displaySecond: true,
                };
            },
            {
                storage: true,
            }
        );
    }

    onunload(): void {
        // 插件卸载时的清理代码
    }
}

const manifest: PluginManifest = {
    name: "时钟",
    description: "显示当前时间",
    id: "timeDisplay",
    minAppVersion: "0.0.0",
    author: "TechClass官方",
    version: "0.0.0",
};


const PluginTimeDisplay: OfficialPlugin = {
    manifest,
    plugin: timeDisplay,
};

export type timeDisplayComponentProps = componentProps<timeDisplay>;

export default PluginTimeDisplay;
