import {componentItem, defaultDraggableComponentStatus, draggableComponentStatus} from "./base";
import {defineComponent, ref, Ref, ShallowRef, shallowRef} from "vue";

/**
 * 主面板组件类
 * 继承自componentItem，用于在主界面显示的可拖拽组件
 * @extends componentItem
 */
export class mainBoardComponent extends componentItem {
    /** 组件状态的响应式引用 */
    status: Ref<draggableComponentStatus>;
    component: ShallowRef<ReturnType<typeof defineComponent>>;
    memorizeStatus: boolean;

    /**
     * 创建主面板组件实例
     * @param component - Vue组件实例
     * @param status - 组件的状态配置
     * @param memorizeStatus
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
    }
}

export interface mainBoardStatus {
    [key: string]: draggableComponentStatus
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
    savedStatus: mainBoardStatus
    firstLoaded: boolean

    /**
     * 创建主面板组件管理器实例
     * 初始化空的组件集合
     */
    constructor(savedStatus: mainBoardStatus, saveStatus: () => void) {
        this.components = {};
        this.savedStatus = savedStatus
        this.firstLoaded = false;
    }

    /**
     * 添加主面板组件
     * @param name - 组件名称，作为标识符
     * @param component - Vue组件实例
     * @param status - 组件状态配置，默认使用defaultDraggableComponentStatus
     * @param memorizeStatus
     */
    addComponent(
        name: string,
        component: ReturnType<typeof defineComponent>,
        status: draggableComponentStatus = defaultDraggableComponentStatus,
        memorizeStatus: boolean,
    ) {
        this.components[name] = new mainBoardComponent(component, status, memorizeStatus);
        if (memorizeStatus) {
            this.savedStatus[name] = status;
            
        } else {
            this.savedStatus[name] ? delete this.savedStatus[name] : null;

        }
    }

    /**
     * 移除指定名称的主面板组件
     * @param name - 要移除的组件名称
     * @param keepStatus
     */
    removeComponent(name: string, keepStatus: boolean) {
        delete this.components[name];
        if (!keepStatus && this.savedStatus[name]) {
            delete this.savedStatus[name];
        }
    }

    updateSavedComponentStatus() {
        if (!this.firstLoaded) {
            // 第一次还没加载完就保存会出问题
            return;
        }
        for (const name in this.components) {
            const component = this.components[name];
            if (component.memorizeStatus) {
                this.savedStatus[name] = component.status.value;
            }
        }
    }

    applySavedComponentStatus() {
        for (const name in this.components) {
            const component = this.components[name];
            if (this.savedStatus[name]) {
                component.status.value = this.savedStatus[name];
            }
        }
    }

    initSavedComponentStatus() {
        this.firstLoaded = true;
        this.applySavedComponentStatus();

    }
}