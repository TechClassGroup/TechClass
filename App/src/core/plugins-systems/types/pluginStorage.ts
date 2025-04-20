/**
 * @fileOverview 插件存储
 */
import {ref, Ref, toRaw, watch, WatchStopHandle} from "vue";
import {Plugin} from "./plugin.type";
import {localFileSystem} from "../pluginApis/fileSystem";
import {createLogger} from "../../utils/utils";
import {throttle} from "lodash";
import {IpcErrorKind} from "../../../types/rsShared.types";

export interface IStorageConfig {
    storage: boolean;
    maxRetries?: number;
    throttleWait?: number; // 添加节流等待时间配置
}

class storageConfig {
    storage: boolean;
    maxRetries: number;
    throttleWait: number;

    constructor(config: IStorageConfig) {
        this.storage = config.storage;
        this.maxRetries = config.maxRetries || 5;
        this.throttleWait = config.throttleWait || 500; // 默认节流等待时间为1秒
    }
}

export type storageDefaultValue<T = any> = () => T;

export class PluginStorage<T extends object = any> {
    content: Ref<T>;

    private _plugin: Plugin;
    private config: storageConfig;
    private readonly _fileSystem: localFileSystem;
    private readonly _defaultValue: storageDefaultValue<T>;
    private readonly _fileName: string;
    private _logger: createLogger;
    private _storeWatcher: WatchStopHandle | null;
    private readonly storageFunc: Function;

    constructor(
        plugin: Plugin,
        config: IStorageConfig,
        defaultValueFunc: storageDefaultValue<T>,
        onLoadComplete?: () => void
    ) {
        // 必要信息
        this._plugin = plugin;
        this._defaultValue = defaultValueFunc;
        this.config = new storageConfig(config);
        // 工具
        this._fileSystem = new localFileSystem(
            plugin.manifest.id,
            plugin.isOfficial
        );
        this._fileName = `${plugin.manifest.id}.config.json`;
        this._logger = new createLogger(`[${plugin.manifest.id}][插件存储]`);
        this._storeWatcher = null;
        // 主要逻辑
        this.content = ref(this._defaultValue()) as Ref<T>;
        // 自动存储函数
        this.storageFunc = throttle(() => {
            let retryCount = 0;
            this._logger.trace("存储数据");
            const attemptStorage = () => {
                this._fileSystem
                    .writeFile(
                        this._fileName,
                        JSON.stringify(this.content.value)
                    )
                    .then(() => {
                        this._logger.trace("存储成功", this._fileName);
                        retryCount = 0;
                    })
                    .catch((error: IpcErrorKind) => {
                        retryCount++;
                        this._logger.error(
                            "存储失败",
                            this._fileName,
                            error,
                            retryCount
                        );
                        if (retryCount <= this.config.maxRetries) {
                            attemptStorage();
                        } else {
                            this._logger.error(
                                "存储失败，超过最大重试次数",
                                this._fileName,
                                error
                            );
                        }
                    });
            };
            attemptStorage();
        }, this.config.throttleWait);
        // 监听存储
        if (config.storage) {
            this.load().then(() => {
                onLoadComplete?.();
                this._storeWatcher = watch(
                    () => toRaw(this.content).value,
                    () => {
                        this.storageFunc();
                    },
                    {
                        deep: true,
                    }
                );
            });
        }
    }

    async load() {
        try {
            const exists = await this._fileSystem.exists(this._fileName);
            if (!exists.exists) {
                this._logger.info("文件不存在，使用默认值", this._fileName);
                this.content.value = this._defaultValue();
                await this.save();
                return;
            }
            this._logger.trace("文件存在，加载数据", this._fileName);
            const data = await this._fileSystem.readFile(this._fileName);
            try {
                const parsedData = JSON.parse(data);
                this.content.value = parsedData as T;
                this._logger.info("加载成功", this._fileName);
            } catch (e) {
                this._logger.error(
                    "解析JSON失败，使用默认值",
                    this._fileName,
                    e
                );
                this.content.value = this._defaultValue();
                await this.save();
            }
        } catch (e) {
            this._logger.error("加载存储数据失败", this._fileName, e);
            this.content.value = this._defaultValue();
        }
    }

    async save() {
        try {
            this._logger.trace("保存数据", this.content.value);
            const data = JSON.stringify(this.content.value, null, 2);
            await this._fileSystem.writeFile(this._fileName, data);
            this._logger.info("保存成功", this._fileName);
        } catch (e) {
            this._logger.error("保存数据失败", this._fileName, e);
        }
    }

    cleanup() {
        if (this._storeWatcher) {
            this._storeWatcher();
            this._storeWatcher = null;
        }
        // @ts-ignore
        this._plugin = null;
    }
}
