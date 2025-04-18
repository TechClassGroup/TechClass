/**
 * @fileOverview 官方插件
 */
import {OfficialPlugin} from "./plugin.type";

const officialPlugins: OfficialPlugin[] = []
export default officialPlugins.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));