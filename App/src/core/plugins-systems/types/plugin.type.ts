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

    protected constructor(
        app: App,
        manifest: PluginManifest,
        componentStatus: pluginComponent
    ) {
        this.app = app;
        this.manifest = manifest;
        this.componentStatus = componentStatus;
    }

    abstract onload(): Promise<void> | void;

    abstract onunload(): void;
}

export interface OfficialPlugin {
    plugin: typeof Plugin;
    manifest: PluginManifest;
}
