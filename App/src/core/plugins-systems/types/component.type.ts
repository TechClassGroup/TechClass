/**
 * @fileOverview 组件的类型定义
 */
import {defineComponent, ref, Ref, shallowRef, ShallowRef} from "vue";
import {Plugin} from "./plugin.type";

/**
 * 可拖拽组件的状态配置接口
 * 定义了组件的位置、大小、层级及交互属性
 */
export interface draggableComponentStatus {
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
 * 可拖拽组件状态的默认配置
 * 为新创建的组件提供默认值
 */
export const defaultDraggableComponentStatus: draggableComponentStatus = {
    draggable: true,
    height: "auto",
    maxHeight: 0,
    maxWidth: 0,
    minHeight: 0,
    minWidth: 0,
    resizable: true,
    width: "auto",
    x: 0,
    y: 0,
    zIndex: 0,
};

/**
 * 组件项基类
 * 所有具体组件类型的基础类，提供组件引用存储
 */
export class componentItem {
    /** 组件的浅层引用，用于存储Vue组件实例 */
    component: ShallowRef<ReturnType<typeof defineComponent>>;
}

/**
 * 主面板组件类
 * 继承自componentItem，用于在主界面显示的可拖拽组件
 * @extends componentItem
 */
class mainBoardComponent extends componentItem {
    /** 组件状态的响应式引用 */
    status: Ref<draggableComponentStatus>;

    /**
     * 创建主面板组件实例
     * @param component - Vue组件实例
     * @param status - 组件的状态配置
     */
    constructor(
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus
    ) {
        super();
        this.component = shallowRef(component);
        this.status = ref(status);
    }
}

/**
 * 设置页面组件类
 * 继承自componentItem，用于在设置页面显示的组件
 * @extends componentItem
 */
class settingPageComponent extends componentItem {
    /**
     * 创建设置页面组件实例
     * @param component - Vue组件实例
     */
    constructor(component: ReturnType<typeof defineComponent>) {
        super();
        this.component = shallowRef(component);
    }
}

/**
 * 插件组件管理类
 * 用于管理插件的主面板组件和设置页面组件
 */
export class pluginComponent {
    /** 主面板组件集合，键为组件名称，值为对应的主面板组件实例 */
    mainPage: Record<string, mainBoardComponent>;
    /** 设置页面组件，如果未设置则为null */
    settingPage: settingPageComponent | null;

    /**
     * 创建插件组件管理实例
     * 初始化空的组件集合
     */
    constructor() {
        this.mainPage = {};
        this.settingPage = null;
    }

    /**
     * 添加主面板组件
     * @param name - 组件名称，作为标识符
     * @param component - Vue组件实例
     * @param status - 组件状态配置，默认使用defaultDraggableComponentStatus
     */
    addMainPageComponent(
        name: string,
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus = defaultDraggableComponentStatus
    ) {
        this.mainPage[name] = new mainBoardComponent(component, status);
    }

    /**
     * 设置插件的设置页面组件
     * @param component - Vue组件实例
     */
    setSettingPageComponent(component: ReturnType<typeof defineComponent>) {
        this.settingPage = new settingPageComponent(component);
    }

    /**
     * 移除指定名称的主面板组件
     * @param name - 要移除的组件名称
     */
    removeMainPageComponent(name: string) {
        delete this.mainPage[name];
    }

    /**
     * 移除设置页面组件
     * 将设置页面组件引用设为null
     */
    removeSettingPageComponent() {
        this.settingPage = null;
    }
}

/**
 * 组件属性接口
 * 定义了传递给插件组件的属性
 */
export interface componentProps {
    /** 插件实例 */
    plugin: Plugin;
}
