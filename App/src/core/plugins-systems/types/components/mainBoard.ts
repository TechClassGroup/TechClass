import {componentItem, defaultDraggableComponentStatus, draggableComponentStatus,} from "./base";
import {defineComponent, ref, Ref, ShallowRef, shallowRef, watch} from "vue";
import logger from "../../../utils/logger";

/**
 * 主面板组件类
 * 继承自componentItem，用于在主界面显示的可拖拽组件
 * @extends componentItem
 */
export class mainBoardComponent extends componentItem {
    /** 组件状态的响应式引用 */
    status: Ref<draggableComponentStatus>;
    /** 组件实例的浅层引用 */
    component: ShallowRef<ReturnType<typeof defineComponent>>;
    /** 是否记住组件状态 */
    memorizeStatus: boolean;

    /**
     * 创建主面板组件实例
     * @param component - Vue组件实例
     * @param status - 组件的状态配置
     * @param memorizeStatus - 是否记住组件状态
     */
    constructor(
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus,
        memorizeStatus: boolean
    ) {
        super();
        this.component = shallowRef(component);
        this.status = ref(status);
        this.memorizeStatus = memorizeStatus;
        logger.debug(
            `创建主面板组件实例: ${
                component.name || "未命名组件"
            }, 是否记住状态: ${memorizeStatus}`
        );
    }
}

/**
 * 主面板状态接口
 * 存储组件状态的键值对集合
 */
export interface mainBoardStatus {
    [key: string]: draggableComponentStatus;
}

/**
 * 主面板组件管理器类
 * 负责管理所有主面板组件的增删改操作，提高组件管理的内聚性
 */
export class MainBoardComponentManager {
    /**
     * 主面板组件集合，键为组件名称，值为对应的主面板组件实例
     */
    components: Record<string, mainBoardComponent>;

    /**
     * 保存的组件状态集合
     */
    savedStatus: mainBoardStatus;

    /**
     * 是否已完成首次加载
     */
    firstLoaded: boolean;

    /**
     * 状态保存回调函数
     * @private
     */
    private readonly saveCallback: () => void;

    /**
     * 创建主面板组件管理器实例
     * @param savedStatus - 已保存的组件状态集合
     * @param saveStatus - 状态保存回调函数
     */
    constructor(savedStatus: mainBoardStatus, saveStatus: () => void) {
        this.components = {};
        this.savedStatus = savedStatus;
        this.firstLoaded = false;
        this.saveCallback = saveStatus;
        logger.info("初始化主面板组件管理器");
    }

    /**
     * 添加主面板组件
     * @param name - 组件名称，作为标识符
     * @param component - Vue组件实例
     * @param status - 组件状态配置，默认使用defaultDraggableComponentStatus
     * @param memorizeStatus - 是否记住组件状态
     */
    addComponent(
        name: string,
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus = defaultDraggableComponentStatus,
        memorizeStatus: boolean
    ) {
        logger.info(`添加主面板组件: ${name}`);
        // 创建组件实例
        const componentInstance = new mainBoardComponent(
            component,
            status,
            memorizeStatus
        );
        this.components[name] = componentInstance;

        // 检查是否已经存在保存的状态，如果存在则应用
        if (this.firstLoaded && this.savedStatus[name] && memorizeStatus) {
            logger.debug(`应用已保存的组件状态: ${name}`);
            componentInstance.status.value = this.savedStatus[name];
        }

        // 管理保存的状态
        // 如果你没有手动释放状态，我们不会自动清理，他会一直存在
        if (memorizeStatus) {
            this.savedStatus[name] = componentInstance.status.value;
            logger.debug(`保存组件状态: ${name}`);
        }
        // todo 自动清理

        // 监听组件状态变化，自动保存
        if (memorizeStatus) {
            // todo 这边以后要加一个cleanup watchers
            watch(
                componentInstance.status,
                () => {
                    logger.trace(`组件状态变化，更新保存状态: ${name}`);
                    this.updateSavedComponentStatus();
                },
                {deep: true}
            );
        }
    }

    /**
     * 移除指定名称的主面板组件
     * @param name - 要移除的组件名称
     * @param keepStatus - 是否保留组件状态 不保存就给你删咯
     */
    removeComponent(name: string, keepStatus: boolean) {
        logger.info(`移除主面板组件: ${name}, 保留状态: ${keepStatus}`);
        delete this.components[name];
        if (!keepStatus && this.savedStatus[name]) {
            logger.debug(`删除已保存的组件状态: ${name}`);
            delete this.savedStatus[name];
        }
    }

    /**
     * 更新所有已保存的组件状态
     * 仅保存memorizeStatus为true的组件状态
     */
    updateSavedComponentStatus() {
        if (!this.firstLoaded) {
            // 第一次还没加载完就保存会出问题
            logger.warn("组件尚未完成首次加载，跳过状态保存");
            return;
        }

        logger.debug("更新保存的组件状态");
        for (const name in this.components) {
            const component = this.components[name];
            if (component.memorizeStatus) {
                this.savedStatus[name] = component.status.value;
            }
        }

        this.saveCallback();
    }

    /**
     * 应用已保存的组件状态到当前组件
     */
    applySavedComponentStatus() {
        logger.info("应用已保存的组件状态");
        for (const name in this.components) {
            const component = this.components[name];
            if (this.savedStatus[name]) {
                logger.debug(`应用组件状态: ${name}`);
                component.status.value = this.savedStatus[name];
            }
        }
    }

    /**
     * 初始化组件状态
     * 标记首次加载完成并应用保存的状态
     */
    initSavedComponentStatus() {
        logger.info("初始化组件状态，标记首次加载完成");
        this.firstLoaded = true;
        this.applySavedComponentStatus();
    }
}
