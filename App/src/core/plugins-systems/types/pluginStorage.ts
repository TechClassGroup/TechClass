/**
 * @fileOverview 插件存储
 */
import {ref, Ref, toRaw, watch, WatchStopHandle} from "vue";
import {Plugin} from "./plugin.type";
import {localFileSystem} from "../pluginApis/fileSystem";
import {createLogger} from "../../utils/utils";
import {throttle} from "lodash";
import {IpcErrorKind} from "../../../types/rsShared.types";

/**
 * 插件存储配置接口
 */
export interface IStorageConfig {
    /** 是否启用自动存储，启用后会自动监听数据变化并保存 */
    storage: boolean;
    /** 存储失败时的最大重试次数，默认为5次 */
    maxRetries?: number;
    /** 节流等待时间（毫秒），控制自动存储的频率，默认为300ms */
    throttleWait?: number;
}

/**
 * 存储配置实现类
 * @internal
 */
class storageConfig {
    storage: boolean;
    maxRetries: number;
    throttleWait: number;

    constructor(config: IStorageConfig) {
        this.storage = config.storage;
        this.maxRetries = config.maxRetries || 5;
        this.throttleWait = config.throttleWait || 300;
    }
}

/**
 * 返回存储默认值的函数类型
 * @template T - 存储数据的类型，默认为any
 */
export type storageDefaultValue<T = any> = () => T;

/**
 * 插件存储类，用于管理插件的共用数据，以及持久化
 * - 请不要直接实例化该类，而是使用initStorage方法
 * @template T - 存储数据的类型，必须是对象类型，默认为any
 */
export class PluginStorage<T extends object = any> {
    /**
     * 存储内容的响应式引用
     * 可通过.value访问或修改存储的数据
     * 对数据的修改会自动保存（如果启用了自动存储）
     */
    content: Ref<T>;

    private _plugin: Plugin<T>;
    private config: storageConfig;
    private readonly _fileSystem: localFileSystem;
    private readonly _defaultValue: storageDefaultValue<T>;
    private readonly _fileName: string;
    private _logger: createLogger;
    private _storeWatcher: WatchStopHandle | null;
    private readonly storageFunc: Function;

    /**
     * 创建插件存储实例
     * @param plugin - 插件实例，类型必须匹配泛型T
     * @param config - 存储配置
     * @param defaultValueFunc - 返回默认值的函数
     * @param onLoadComplete - 存储加载完成后的回调函数
     */
    constructor(
        plugin: Plugin<T>,
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
        // 自动存储函数 带节流
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
                this._logger.debug("存储加载完成", this._fileName);
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

    /**
     * 从文件加载存储数据
     * 如果文件不存在或加载失败，将使用默认值
     */
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

    /**
     * 手动保存存储数据到文件
     * 通常不需要手动调用，启用自动存储后会自动保存
     */
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

    /**
     * 清理存储资源
     * 插件卸载时会自动调用
     * @internal
     */
    cleanup() {
        if (this._storeWatcher) {
            this._storeWatcher();
            this._storeWatcher = null;
        }
        // @ts-ignore
        this._plugin = null;
    }
}
