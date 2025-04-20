/**
 * @fileOverview 官方插件
 */
import {OfficialPlugin} from "./types/plugin.type";
import timeDisplay from "../../plugins/timeDisplay/timeDisplay";

const officialPlugins: OfficialPlugin[] = [
    timeDisplay
]
export default officialPlugins.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));