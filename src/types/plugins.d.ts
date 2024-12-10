/**
 * @fileOverview 插件的类型
 */
import {defineComponent} from "vue";
import {Store} from "pinia";

/**
 * 插件的组件
 */
interface PluginComponent {
    setting_page: ReturnType<typeof defineComponent> | null;
    main_page: ReturnType<typeof defineComponent> | null;

}

/**
 * 插件对象
 */
export interface IPlugin {
    name: string;
    id: string;
    description: string;
    component: PluginComponent;
    init: (app: Store) => void
}

/**
 * 插件实例
 */
export interface InstancePlugin {
    pluginObject: IPlugin
    store: Store;
}

/**
 * 仅暴露插件的组件以及其store
 */
export interface PluginComponentStore {
    component: PluginComponent;
    store: Store;
    id: string;
}