/**
 * @fileOverview 组件的类型定义
 */
import {defineComponent} from "vue";
import {defaultDraggableComponentStatus, draggableComponentStatus,} from "./base";
import {MainBoardComponentManager, mainBoardStatus} from "./mainBoard";
import {SettingPageComponentManager} from "./settingPage";
import {localFileSystem} from "../../pluginApis/fileSystem";
import {throttle} from "lodash";
import logger from "../../../utils/logger";

export type savedStatus = {
    mainBoard: mainBoardStatus;
};

/**
 * 插件组件管理类
 * 用于管理插件的主面板组件和设置页面组件
 */
export class pluginComponent {
    /** 主面板组件管理器 */
    readonly mainBoardManager: MainBoardComponentManager;
    /** 设置页面组件管理器 */
    readonly settingPageManager: SettingPageComponentManager;
    /** 保存的状态对象 */
    savedStatus: savedStatus;
    /** 状态文件名 */
    private readonly FileName: string;
    /** 文件系统接口 */
    private readonly FileSystem: localFileSystem;
    /** 节流保存函数 */
    private readonly throttledSaveStatusToFile: ReturnType<typeof throttle>;
    /** 插件ID */
    private readonly pluginId: string;

    /**
     * 创建插件组件管理实例
     * 初始化主面板组件管理器和设置页面组件管理器
     * @param pluginId - 插件唯一标识符
     * @param isOfficial - 是否为官方插件
     */
    constructor(pluginId: string, isOfficial: boolean) {
        this.pluginId = pluginId;
        logger.info(`创建插件组件管理器: ${pluginId}, 官方插件: ${isOfficial}`);

        this.savedStatus = {
            mainBoard: {},
        };

        this.saveStatus = this.saveStatus.bind(this);
        this.savedStatusToFile = this.savedStatusToFile.bind(this);

        this.throttledSaveStatusToFile = throttle(this.savedStatusToFile, 500);

        this.mainBoardManager = new MainBoardComponentManager(
            this.savedStatus.mainBoard,
            this.saveStatus
        );
        this.settingPageManager = new SettingPageComponentManager();
        this.FileName = `${pluginId}.status.json`;
        this.FileSystem = new localFileSystem(pluginId, isOfficial);

        this.loadSavedStatus().then();
    }

    /**
     * 加载保存的组件状态
     * 从文件系统中读取并应用之前保存的状态
     */
    async loadSavedStatus() {
        try {
            logger.info(`加载插件状态: ${this.pluginId}`);
            const exists = await this.FileSystem.exists(this.FileName);
            if (exists.exists) {
                logger.debug(`发现状态文件: ${this.FileName}`);
                const content = await this.FileSystem.readFile(this.FileName);

                const data = JSON.parse(content);
                // 使用 data 的 keys 而不是 this.saveStatus
                Object.keys(data).forEach((key) => {
                    if (
                        this.savedStatus[key] &&
                        typeof this.savedStatus[key] === "object"
                    ) {
                        Object.assign(
                            this.savedStatus[key] as object,
                            data[key]
                        );
                    } else {
                        this.savedStatus[key] = data[key];
                    }
                });
                logger.debug(`状态加载完成: ${this.pluginId}`);
            } else {
                logger.debug(`无状态文件，使用默认状态: ${this.pluginId}`);
            }
            // 只传递 mainBoard 对象，而不是整个 savedStatus
            this.mainBoardManager.initSavedComponentStatus();
        } catch (e) {
            // 错误处理
            logger.error(`加载状态失败: ${this.pluginId}`, e);
        }
    }

    /**
     * 触发保存状态操作
     * 通过节流函数延迟调用实际的保存操作
     */
    saveStatus() {
        logger.trace(`触发状态保存: ${this.pluginId}`);
        // 通过节流函数调用保存到文件的方法
        this.throttledSaveStatusToFile();
    }

    /**
     * 将状态保存到文件
     * 实际执行文件写入操作
     */
    async savedStatusToFile() {
        try {
            logger.debug(`保存状态到文件: ${this.pluginId}`);
            const content = JSON.stringify(this.savedStatus);
            await this.FileSystem.writeFile(this.FileName, content);
            logger.trace(`状态保存成功: ${this.pluginId}`);
        } catch (e) {
            logger.error(`保存状态失败: ${this.pluginId}`, e);
        }
    }

    /**
     * 添加主面板组件（委托方法）
     * @param name - 组件名称，作为标识符
     * @param component - Vue组件实例
     * @param memorizeStatus - 是否记住组件状态
     * @param status - 组件状态配置，默认使用defaultDraggableComponentStatus
     */
    addMainPageComponent(
        name: string,
        component: ReturnType<typeof defineComponent>,
        memorizeStatus: boolean = false,
        status: draggableComponentStatus = defaultDraggableComponentStatus
    ) {
        logger.info(`插件${this.pluginId}添加主面板组件: ${name}`);
        this.mainBoardManager.addComponent(
            name,
            component,
            status,
            memorizeStatus
        );
    }

    /**
     * 移除指定名称的主面板组件（委托方法）
     * @param name - 要移除的组件名称
     * @param keepStatus - 是否保留组件状态
     */
    removeMainPageComponent(name: string, keepStatus: boolean = false) {
        logger.info(
            `插件${this.pluginId}移除主面板组件: ${name}, 保留状态: ${keepStatus}`
        );
        this.mainBoardManager.removeComponent(name, keepStatus);
    }

    /**
     * 设置插件的设置页面组件（委托方法）
     * @param component - Vue组件实例
     */
    setSettingPageComponent(component: ReturnType<typeof defineComponent>) {
        logger.info(`插件${this.pluginId}设置设置页面组件`);
        this.settingPageManager.setComponent(component);
    }

    /**
     * 移除设置页面组件（委托方法）
     */
    removeSettingPageComponent() {
        logger.info(`插件${this.pluginId}移除设置页面组件`);
        this.settingPageManager.removeComponent();
    }
}
