/**
 * @fileOverview 插件的类型定义文件
 */

import {App} from "../appInstance";
import {pluginComponent} from "./component.type";

import {IStorageConfig, PluginStorage, storageDefaultValue} from "./pluginStorage.type";
import logger from "../../utils/logger";

export interface PluginManifest {
    id: string;
    name: string;
    author: string;
    description: string;
    version: string;
    minAppVersion: string;
}

export abstract class Plugin {
    app: App;
    manifest: PluginManifest;
    componentStatus: pluginComponent;
    readonly isOfficial: boolean;
    storage: PluginStorage | null;

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

    abstract onload(): Promise<void> | void;

    abstract onunload(): void;

    cleanup(): void {
        // 释放资源，防止循环引用

        if (this.storage) {
            this.storage.cleanup()
        }
        // @ts-ignore
        this.componentStatus = null;
        // @ts-ignore
        this.manifest = null;
        // @ts-ignore
        this.app = null;
    }

    initStorage(defaultValue: storageDefaultValue, config: IStorageConfig, completeCallback: () => void): void {
        if (this.storage) {
            logger.warn(`${this.manifest.id} 插件存储已经初始化，无法重复初始化`);
        }
        this.storage = new PluginStorage(this, config, defaultValue, completeCallback);
    }
}

export interface OfficialPlugin {
    plugin: typeof Plugin;
    manifest: PluginManifest;
}
