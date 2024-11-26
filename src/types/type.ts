import {defineComponent} from "vue";
import {Store} from "pinia";

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
    setting_page: ReturnType<typeof defineComponent>;
    main_page: ReturnType<typeof defineComponent>;
    independent_page: ReturnType<typeof defineComponent>;
    init: (store: Store) => void;
}

/**
 * 官方插件
 */
export interface OfficialPlugin extends IPlugin {
    official: true;

}