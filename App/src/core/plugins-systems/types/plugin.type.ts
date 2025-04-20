/**
 * @fileOverview 插件的类型定义文件
 */

import {App} from "../appInstance";
import {pluginComponent} from "./component.type";

import {IStorageConfig, PluginStorage, storageDefaultValue,} from "./pluginStorage";
import logger from "../../utils/logger";

/**
 * 插件清单接口
 * 定义了插件的基本信息和元数据
 */
export interface PluginManifest {
    /** 插件的唯一标识符 */
    id: string;
    /** 插件的显示名称 */
    name: string;
    /** 插件的作者信息 */
    author: string;
    /** 插件的功能描述 */
    description: string;
    /** 插件的版本号 */
    version: string;
    /** 插件所需的最低应用版本 */
    minAppVersion: string;
}

/**
 * 插件基类
 * @template T - 可选的插件存储数据类型，必须是一个对象类型
 *              - 如果提供此泛型，则插件的存储数据必须遵循此类型约束
 *              - 如果不提供，则默认为any类型
 */
export abstract class Plugin<T extends object = any> {
    /**
     * 应用的实例
     * - 请尽量在插件中通过该方式访问应用实例
     */
    app: App;
    /**
     * 插件的配置文件
     */
    manifest: PluginManifest;
    /**
     * 选然后的组件状态
     */
    componentStatus: pluginComponent;
    readonly isOfficial: boolean;
    /**
     * 插件的存储对象，类型由泛型T决定
     * 初始为null，需要调用initStorage方法进行初始化
     */
    storage: PluginStorage<T> | null;

    protected constructor(
        app: App,
        manifest: PluginManifest,
        componentStatus: pluginComponent,
        isOfficial: boolean
    ) {
        this.app = app;
        this.manifest = manifest;
        this.componentStatus = componentStatus;
        this.isOfficial = isOfficial;
        this.storage = null;
    }

    /**
     * 插件加载时调用的方法
     */
    abstract onload(): Promise<void> | void;

    /**
     * 插件卸载时调用的方法
     */
    abstract onunload(): void;

    /**
     * 清理插件资源
     */
    cleanup(): void {
        // 释放资源，防止循环引用

        if (this.storage) {
            this.storage.cleanup();
        }
        // @ts-ignore
        this.componentStatus = null;
        // @ts-ignore
        this.manifest = null;
        // @ts-ignore
        this.app = null;
    }

    /**
     * 初始化插件存储
     * @param defaultValue - 返回默认值的函数，返回值必须符合泛型T的类型约束
     * @param config - 存储配置项，如是否启用自动存储、最大重试次数等
     * @param completeCallback - 存储初始化完成后的回调函数
     */
    initStorage(
        defaultValue: storageDefaultValue<T>,
        config: IStorageConfig,
        completeCallback: () => void = () => {
        }
    ): void {
        if (this.storage) {
            logger.warn(
                `${this.manifest.id} 插件存储已经初始化，无法重复初始化`
            );
            return;
        }

        this.storage = new PluginStorage<T>(
            this,
            config,
            defaultValue,
            completeCallback
        );
    }
}

/**
 * 官方插件接口
 * 注意：此接口不受泛型约束，用于注册插件时使用
 */
export interface OfficialPlugin {

    plugin: typeof Plugin<any>;
    manifest: PluginManifest;
}
