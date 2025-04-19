/**
 * 提供App类
 */
import {Plugin} from "./plugin.type";
import {ref, Ref} from "vue";

/**
 * 应用的App类
 * 不可以直接实例化，请使用单例
 */
class AppClass {
    /**
     * 已加载插件的集合
     */
    plugins: Ref<Record<string, Plugin>> = ref({});
}

export type App = AppClass;
export const appInstance = new AppClass();
