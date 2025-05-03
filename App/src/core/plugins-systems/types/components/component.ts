/**
 * @fileOverview 组件的类型定义
 */
import {defineComponent} from "vue";
import {defaultDraggableComponentStatus, draggableComponentStatus} from "./base";
import {MainBoardComponentManager} from "./mainBoard";
import {SettingPageComponentManager} from "./settingPage";

/**
 * 插件组件管理类
 * 用于管理插件的主面板组件和设置页面组件
 */
export class pluginComponent {
    /** 主面板组件管理器 */
    readonly mainBoardManager: MainBoardComponentManager;
    /** 设置页面组件管理器 */
    readonly settingPageManager: SettingPageComponentManager;

    /**
     * 创建插件组件管理实例
     * 初始化主面板组件管理器和设置页面组件管理器
     */
    constructor() {
        this.mainBoardManager = new MainBoardComponentManager();
        this.settingPageManager = new SettingPageComponentManager();
    }


    /**
     * 添加主面板组件（委托方法）
     * @param name - 组件名称，作为标识符
     * @param component - Vue组件实例
     * @param status - 组件状态配置，默认使用defaultDraggableComponentStatus
     */
    addMainPageComponent(
        name: string,
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus = defaultDraggableComponentStatus
    ) {
        this.mainBoardManager.addComponent(name, component, status);
    }

    /**
     * 移除指定名称的主面板组件（委托方法）
     * @param name - 要移除的组件名称
     */
    removeMainPageComponent(name: string) {
        this.mainBoardManager.removeComponent(name);
    }

    /**
     * 设置插件的设置页面组件（委托方法）
     * @param component - Vue组件实例
     */
    setSettingPageComponent(component: ReturnType<typeof defineComponent>) {
        this.settingPageManager.setComponent(component);
    }

    /**
     * 移除设置页面组件（委托方法）
     */
    removeSettingPageComponent() {
        this.settingPageManager.removeComponent();
    }


}

