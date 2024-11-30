import {defineComponent} from "vue";

/**
 * 版本号
 */
export interface Version {
    major: number;
    minor: number;
    patch: number;
}

/**
 * 插件的基本属性
 */
interface IPlugin {
    name: string;
    id: string;
    description: string;
    setting_page: ReturnType<typeof defineComponent> | null;
    main_page: ReturnType<typeof defineComponent> | null;

}

/**
 * 官方插件
 */
export interface OfficialPlugin extends IPlugin {
    official: true;
}

/**
 * 自定义插件
 */
export interface customPlugin extends IPlugin {
    official: false;
}

/**
 * 插件对象
 */
export interface PluginObject {
    create: () => OfficialPlugin | customPlugin
    init: () => void

}