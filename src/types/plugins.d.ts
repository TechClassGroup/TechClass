/**
 * @fileOverview 插件的类型
 */
import {defineComponent} from "vue";
import {Store} from "pinia";

/**
 * 可拖拽组件的配置参数。
 */
export interface DraggableComponentStatus {
    /** 组件最大宽度 */
    maxWidth: number;
    /** 组件最大高度 */
    maxHeight: number;
    /** 组件最小宽度 */
    minWidth: number;
    /** 组件最小高度 */
    minHeight: number;
    /**
     * 组件当前的宽度
     * 如果为"auto"，则在组件挂载时自动计算宽度
     * 组件被调整大小时，会自动更新为新的宽度
     */
    width: number | "auto";
    /**
     * 组件当前的高度
     * 如果为"auto"，则在组件挂载时自动计算高度
     * 组件被调整大小时，会自动更新为新的高度
     */
    height: number | "auto";
    /** 组件X坐标位置 */
    x: number;
    /** 组件Y坐标位置 */
    y: number;
    /** 是否可拖拽 */
    draggable: boolean;
    /** 是否可调整大小 */
    resizable: boolean;
    /** 组件的层级 该值越高就在越上方 */
    zIndex: number;
}

/**
 * 插件的组件
 * @template T - mainPage中，会出现组件的key
 */
interface PluginComponent<T extends string = string> {
    /** 设置页面的组件 */
    settingPage: ReturnType<typeof defineComponent> | null;
    /**
     * 主页面组件
     */
    mainPage: Record<T, ReturnType<typeof defineComponent>> | null;
}

/**
 * 插件的状态定义。
 * @template T - 组件名称的类型。
 */
export interface PluginState<T extends string = string> extends StateTree {
    /** 组件状态记录，键为组件名称，值为可拖拽组件的当前状态 */
    componentStatus: Record<T, DraggableComponentStatus>;
}

/**
 * 插件存储的配置定义。
 * @template T - 组件名称的类型，默认为字符串类型。
 * @template Actions - 即将被添加到插件的 `store` 中的 `actions`  | 你可以和`pinia`中的`actions`一样定义
 * @template Getters - 即将被添加到插件的 `store` 中的 `getters` | 你可以和`pinia`中的`getters`一样定义
 */
interface StoreConfig<T extends string = string, Actions = {}, Getters = {}> {
    /** 插件存储的初始状态 注意: 不能使用key `componentStatus` */
    state?: () => {
        [key: string]: any;
    };
    /** 插件存储的 actions */
    actions?: Actions;
    /** 插件存储的 getters */
    getters?: Getters;
}

/**
 * 插件存储的类型定义。
 * @template T - 组件名称的类型，默认为字符串类型。
 */
export type PluginStore<T extends string = string> = Store<
    string,
    PluginState<T>,
    any,
    any
>;

/**
 * 插件对象的定义。
 * @template T - 组件名称的类型，默认为字符串类型。
 * @template Actions -  即将被添加到插件的 `store` 中的 `actions`  | 你可以和`pinia`中的`actions`一样定义
 * @template Getters -  即将被添加到插件的 `store` 中的 `getters` | 你可以和`pinia`中的`getters`一样定义
 */
export interface IPlugin<
    T extends string = string,
    Actions = {},
    Getters = {}
> {
    /** 插件的名称 */
    name: string;
    /** 插件的唯一标识符 */
    id: string;
    /** 插件的描述 */
    description: string;
    /** 插件的组件定义 */
    component: PluginComponent<T>;
    /**
     * 插件的API
     * - 这些API可以被其他插件随意访问
     * - 请注意安全性
     */
    api?: Record<string, any>;
    /** 配置插件的store */
    storeConfig?: StoreConfig<T, Actions, Getters>;
}

/**
 * 插件实例的定义。
 */
export interface InstancePlugin {
    /** 插件对象 */
    pluginObject: IPlugin;
    /** 插件的pinia store */
    store: PluginStore;
}

/**
 * 仅暴露插件的组件及其存储的定义。
 * 一般用于动态组件渲染时，只获得必要的数据
 */
export interface PluginComponentStore {
    /** 插件的组件 */
    component: PluginComponent;
    /** 插件的pinia store */
    store: PluginStore;
    /** 插件的唯一标识符 */
    id: string;
}

/**
 * 插件组件的传入的props
 */
export interface PluginProps {
    /** 插件的pinia store */
    store: PluginStore;
}
