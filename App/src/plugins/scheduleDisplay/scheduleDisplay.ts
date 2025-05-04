/**
 * @fileOverview 课表展示器插件
 */
import {OfficialPlugin, Plugin, PluginManifest} from "../../core/plugins-systems/types/plugin.type";
import NextLesson from "./component/nextLesson.vue";
import LessonListDisplay from "./component/lessonListDisplay.vue";


class ScheduleDisplayPlugin extends Plugin {
    onload() {
        this.componentStatus.addMainPageComponent("nextLesson", NextLesson, true)
        this.componentStatus.addMainPageComponent("lessonList", LessonListDisplay, true)

    }

    onunload() {

    }
}

const manifest: PluginManifest = {
    name: "课表展示器",
    description: "",
    id: "scheduleDisplay",
    version: "0.0.0",
    minAppVersion: "0.0.0",
    author: "TechClass官方"
}
const ScheduleDisplay: OfficialPlugin = {
    manifest,
    plugin: ScheduleDisplayPlugin,
}
export default ScheduleDisplay;