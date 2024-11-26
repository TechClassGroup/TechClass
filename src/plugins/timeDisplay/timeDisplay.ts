/**
 * @fileOverview 时间显示插件
 */
import {OfficialPlugin} from "../../types/type.ts";

const timeDisplay: OfficialPlugin = {
    official: true,
    name: "时钟",
    id: "timeDisplay",
    description: "显示当前的时间",
    setting_page: null,
    main_page: null,
    independent_page: null,
    init() {

    }

}
export default timeDisplay;