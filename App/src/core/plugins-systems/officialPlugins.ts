/**
 * @fileOverview 官方插件
 */
import {OfficialPlugin} from "./types/plugin.type";
import TimeDisplay from "../../plugins/timeDisplay/timeDisplay";
import InfoDisplay from "../../plugins/InfoDisplay/infoDisplay";
import ScheduleEditor from "../../plugins/scheduleEditor/scheduleEditor";
import scheduleDisplay from "../../plugins/scheduleDisplay/scheduleDisplay";

const officialPlugins: OfficialPlugin[] = [
    TimeDisplay,
    InfoDisplay,
    ScheduleEditor,
    scheduleDisplay
]
export default officialPlugins.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));