/**
 * @fileOverview 组件的类型定义
 */
import {defineComponent} from "vue";

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
    zIndex: 0

}

export class componentItem {
    component: ReturnType<typeof defineComponent>

}

class mainBoardComponent extends componentItem {
    status: draggableComponentStatus;

    constructor(component: ReturnType<typeof defineComponent>, status: draggableComponentStatus) {
        super();
        this.component = component;
        this.status = status;
    }
}

class settingPageComponent extends componentItem {
    constructor(component: ReturnType<typeof defineComponent>) {
        super();
        this.component = component;
    }
}

export class pluginComponent {
    mainPage: Record<string, mainBoardComponent>;
    settingPage: Record<string, settingPageComponent>;

    constructor() {
        this.mainPage = {};
        this.settingPage = {};
    }

    addMainPageComponent(name: string, component: ReturnType<typeof defineComponent>,
                         status: draggableComponentStatus = defaultDraggableComponentStatus) {
        this.mainPage[name] = new mainBoardComponent(component, status);
    }

    addSettingPageComponent(name: string, component: ReturnType<typeof defineComponent>) {
        this.settingPage[name] = new settingPageComponent(component);
    }

    removeMainPageComponent(name: string) {
        delete this.mainPage[name];
    }

    removeSettingPageComponent(name: string) {
        delete this.settingPage[name];
    }
}