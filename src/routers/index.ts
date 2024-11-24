/**
 * @fileOverview 根路由路径
 */
import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import setting_routes from "./setting_routes.ts";
import Empty from "../components/Empty.vue";

const routes: Array<RouteRecordRaw> = [
    ...setting_routes,
    {
        path: '/',
        component: Empty
    }
]
const router = createRouter({
    history: createWebHistory(),

    routes
})
export default router