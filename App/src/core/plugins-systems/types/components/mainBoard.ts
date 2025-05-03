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

/**
 * 主面板组件管理器类
 * 负责管理所有主面板组件的增删改操作，提高组件管理的内聚性
 */
export class MainBoardComponentManager {
    /** 主面板组件集合，键为组件名称，值为对应的主面板组件实例 */
    components: Record<string, mainBoardComponent>;

    /**
     * 创建主面板组件管理器实例
     * 初始化空的组件集合
     */
    constructor() {
        this.components = {};
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
    }

    /**
     * 移除指定名称的主面板组件
     * @param name - 要移除的组件名称
     */
    removeComponent(name: string) {
        delete this.components[name];
    }
}