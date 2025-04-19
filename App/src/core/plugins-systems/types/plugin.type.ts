/**
 * @fileOverview 插件的类型定义文件
 */

import {App} from "../appInstance";
import {pluginComponent} from "./component.type";

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
    }

    abstract onload(): Promise<void> | void;

    abstract onunload(): void;

    cleanup(): void {
        // 释放资源，防止循环引用

        // @ts-ignore
        this.componentStatus = null;
        // @ts-ignore
        this.manifest = null;
    }
}

export interface OfficialPlugin {
    plugin: typeof Plugin;
    manifest: PluginManifest;
}
