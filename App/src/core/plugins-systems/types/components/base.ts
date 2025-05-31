import type {defineComponent, ShallowRef} from "vue";

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

    constructor() {
        // 初始化component属性 只是为了让沟槽的Vite闭嘴
        this.component = null as unknown as ShallowRef<ReturnType<typeof defineComponent>>;
    }
}