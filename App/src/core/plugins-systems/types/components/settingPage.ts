/**
 * @fileOverview 设置页面组件类型定义
 */
import {componentItem} from "./base";
import {defineComponent, shallowRef} from "vue";
import logger from "../../../utils/logger";

/**
 * 设置页面组件类
 * 继承自componentItem，用于在设置页面显示的组件
 * @extends componentItem
 */
export class settingPage extends componentItem {
    /**
     * 创建设置页面组件实例
     * @param component - Vue组件实例
     */
    constructor(component: ReturnType<typeof defineComponent>) {
        super();
        this.component = shallowRef(component);
        logger.debug(`创建设置页面组件实例: ${component.name || "未命名组件"}`);
    }
}

/**
 * 设置页面组件管理器类
 * 负责管理设置页面组件的操作，提高组件管理的内聚性
 */
export class SettingPageComponentManager {
    /** 设置页面组件，如果未设置则为null */
    component: settingPage | null;

    /**
     * 创建设置页面组件管理器实例
     * 初始化为空设置页面组件
     */
    constructor() {
        this.component = null;
        logger.info("初始化设置页面组件管理器");
    }

    /**
     * 设置设置页面组件
     * @param component - Vue组件实例
     */
    setComponent(component: ReturnType<typeof defineComponent>) {
        logger.info(`设置设置页面组件: ${component.name || "未命名组件"}`);
        this.component = new settingPage(component);
    }

    /**
     * 移除设置页面组件
     * 将当前组件设置为null
     */
    removeComponent() {
        logger.info("移除设置页面组件");
        this.component = null;
    }
}
