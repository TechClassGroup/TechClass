/**
 * @fileOverview 课表编辑器插件
 */
import {OfficialPlugin, Plugin, PluginManifest} from "../../core/plugins-systems/types/plugin.type";
import ScheduleEditorSetting from "./components/scheduleEditorSetting.vue";
import {clearStore, initializeStore} from "./store/scheduleStore";
import {scheduleEditorApi} from "./scheduleEditor.types";
import {scheduleEditorProfile} from "./store/scheduleEditorProfile";
import {scheduleEditorTodayConfig} from "./store/todayConfigStore";
import {componentProps} from "../../core/plugins-systems/types/components/utils";

export type ConfigType = "course" | "enable" | "todayConfig";

interface TabState {
    currentTabs: {
        course?: string;
        enable?: string;
        todayConfig?: string;
    };
    configType: ConfigType;
}


class scheduleEditor extends Plugin<TabState> {
    api: scheduleEditorApi;

    onload(): Promise<void> | void {
        this.componentStatus.setSettingPageComponent(ScheduleEditorSetting)
        this.initStorage((): TabState => {
            return {
                currentTabs: {
                    course: "subject",
                    enable: "enable",
                    todayConfig: "status",
                },
                configType: "course",
            }

        }, {
            storage: true,
        })
        initializeStore();
        this.api = {
            profile: scheduleEditorProfile,
            todayConfig: scheduleEditorTodayConfig,

        }

    }

    onunload(): void {
        clearStore();
    }

}

export const manifest: PluginManifest = {
    author: "TechClass官方",
    description: "课程表编辑插件",
    id: "scheduleEditor",
    minAppVersion: "0.0.0",
    name: "课表编辑器",
    version: "0.0.0"

}
const PluginScheduleEditor: OfficialPlugin = {
    manifest,
    plugin: scheduleEditor,
}
export type scheduleEditorProps = componentProps<scheduleEditor>
export default PluginScheduleEditor;