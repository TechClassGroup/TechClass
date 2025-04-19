/**
 * 插件的定义文件
 */
export class App {

}

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

    protected constructor(app: App, manifest: PluginManifest) {
        this.app = app;
        this.manifest = manifest;
    }

    abstract onload(): Promise<void> | void;

    abstract onunload(): void;

}

export interface OfficialPlugin {
    plugin: Plugin;
    manifest: PluginManifest;
}

interface ComponentStatus{
    component: any,
    
}
