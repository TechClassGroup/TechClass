/**
 * @fileOverview 插件存储
 */
import {ref, Ref, watch, WatchStopHandle} from "vue";
import {Plugin} from "./plugin.type";
import {localFileSystem} from "../pluginApis/fileSystem";
import {createLogger} from "../../utils/utils";
import {throttle} from "lodash";
import {IpcErrorKind} from "../../../types/rsShared.types";

export interface IStorageConfig {
    storage: boolean;
    maxRetries?: number;
}

class storageConfig {
    storage: boolean;
    maxRetries: number;

    constructor(config: IStorageConfig) {
        this.storage = config.storage;
        this.maxRetries = config.maxRetries || 5;
    }
}

export type storageDefaultValue = () => any;

export class PluginStorage {
    content: Ref<any>;


    private _plugin: Plugin;
    private config: storageConfig;
    private readonly _fileSystem: localFileSystem;
    private readonly _defaultValue: storageDefaultValue;
    private readonly _fileName: string;
    private _logger: createLogger
    private _storeWatcher: WatchStopHandle | null
    private readonly storageFunc: Function;

    constructor(
        plugin: Plugin,
        config: IStorageConfig,
        defaultValueFunc: storageDefaultValue,
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
        this._logger = new createLogger(`[${plugin.manifest.id}][插件存储]`)
        this._storeWatcher = null;
        // 主要逻辑
        this.content = ref(this._defaultValue());

        // 自动存储函数
        this.storageFunc = throttle(() => {
                let retryCount = 0;

                const attemptStorage = () => {
                    this._fileSystem.writeFile(this._fileName, JSON.stringify(this.content.value))
                        .then(() => {
                            this._logger.info('存储成功', this._fileName);
                            retryCount = 0;
                        })
                        .catch((error: IpcErrorKind) => {
                            retryCount++;
                            this._logger.error('存储失败', this._fileName, error, retryCount);
                            if (retryCount <= this.config.maxRetries) {
                                attemptStorage()
                            } else {
                                this._logger.error('存储失败，超过最大重试次数', this._fileName, error);
                            }
                        })
                }
            attemptStorage();
            }
        )
        // 监听存储
        if (config.storage) {
            this.load().then(() => {
                onLoadComplete?.();
                this._storeWatcher = watch(() => {
                    this.content.value
                }, () => {
                    this.storageFunc();
                })
            });
        }

    }

    async load() {

        const exists = await this._fileSystem.exists(this._fileName);
        if (!exists.exists) {
            this._logger.info('文件不存在，使用默认值', this._fileName);
            this.content.value = this._defaultValue();
            await this.save();
            return;
        }
        this._logger.trace('文件存在，加载数据', this._fileName);
        const data = await this._fileSystem.readFile(this._fileName);
        this.content.value = JSON.parse(data);
        this._logger.info('加载成功', this._fileName);

    }

    async save() {
        this._logger.trace('保存数据', this.content.value);
        const data = JSON.stringify(this.content.value, null, 2);
        await this._fileSystem.writeFile(this._fileName, data);
        this._logger.info('保存成功', this._fileName);
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

