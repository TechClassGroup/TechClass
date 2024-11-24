import {RouteRecordRaw} from "vue-router";
import About from "../components/About.vue";
import SettingPage from "../components/SettingPage.vue";

/**
 * @fileOverview 设置页面的路由路径
 */
const setting_routes: Array<RouteRecordRaw> = [
    {
        path: "/setting",
        component: SettingPage,
        children: [
            {
                path: "about",
                component: About
            }
        ]
    }
]
export default setting_routes