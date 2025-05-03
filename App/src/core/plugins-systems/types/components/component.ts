/**
 * @fileOverview 组件的类型定义
 */
import {defineComponent} from "vue";
import {defaultDraggableComponentStatus, draggableComponentStatus} from "./base";
import {MainBoardComponentManager, mainBoardStatus} from "./mainBoard";
import {SettingPageComponentManager} from "./settingPage";
import {localFileSystem} from "../../pluginApis/fileSystem";

export type savedStatus = {
    mainBoard: mainBoardStatus
}

/**
 * 插件组件管理类
 * 用于管理插件的主面板组件和设置页面组件
 */
export class pluginComponent {
    /** 主面板组件管理器 */
    readonly mainBoardManager: MainBoardComponentManager;
    /** 设置页面组件管理器 */
    readonly settingPageManager: SettingPageComponentManager;
    savedStatus: savedStatus
    private readonly FileName: string;
    private readonly FileSystem: localFileSystem

    /**
     * 创建插件组件管理实例
     * 初始化主面板组件管理器和设置页面组件管理器
     */
    constructor(pluginId: string, isOfficial: boolean) {
        this.savedStatus = {
            mainBoard: {}
        }
        this.mainBoardManager = new MainBoardComponentManager(this.savedStatus.mainBoard, this.saveStatus);
        this.settingPageManager = new SettingPageComponentManager();
        this.FileName = `${pluginId}.status.json`;
        this.FileSystem = new localFileSystem(pluginId, isOfficial);

        this.saveStatus = this.saveStatus.bind(this);

    }

    async loadSavedStatus() {
        try {
            const exists = await this.FileSystem.exists(this.FileName);
            if (exists.exists) {
                const content = await this.FileSystem.readFile(this.FileName);
                this.savedStatus = JSON.parse(content);
            }
            this.mainBoardManager.initSavedComponentStatus()
        } catch (e) {
            // 错误处理
        }
    }

    saveStatus() {
        console.log(this.savedStatus)
        // this.savedStatusToFile()
    }

    async savedStatusToFile() {
        try {
            const content = JSON.stringify(this.savedStatus);
            await this.FileSystem.writeFile(this.FileName, content);
        } catch (e) {
            // 错误处理
        }
    }

    /**
     * 添加主面板组件（委托方法）
     * @param name - 组件名称，作为标识符
     * @param component - Vue组件实例
     * @param status - 组件状态配置，默认使用defaultDraggableComponentStatus
     * @param memorizeStatus
     */
    addMainPageComponent(
        name: string,
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus = defaultDraggableComponentStatus,
        memorizeStatus: boolean = false
    ) {
        this.mainBoardManager.addComponent(name, component, status, memorizeStatus);
    }

    /**
     * 移除指定名称的主面板组件（委托方法）
     * @param name - 要移除的组件名称
     * @param keepStatus
     */
    removeMainPageComponent(name: string, keepStatus: boolean = false) {
        this.mainBoardManager.removeComponent(name, keepStatus);
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

