/**
 * @fileOverview Pinia插件
 * @author erduotong
 */
import {PiniaPluginContext, Store} from "pinia";
import {watch} from "vue";
import {throttle} from "lodash";

import {invoke} from "@tauri-apps/api/core";
import logger from "../modules/logger";
import {IpcErrorKind, PluginType} from "../types/rsShared.types";

export interface ConfigStorageOptions {
    config_storage?: {
        enabled: boolean;
        keys?: string[]; // 要监听的keys数组
        throttle_ms?: number; // 延迟时间 以毫秒为单位
        max_retries?: number; // 最大重试次数
    };
    on_storage_load_complete?: (store: Store) => void;
    syncNow?: () => void;
}

type ConfigErrorKind = {
    kind: IpcErrorKind.Io | IpcErrorKind.Json | IpcErrorKind.InvalidPluginType;
};

/**
 * 配置存储插件 用于将store的状态存储到Tauri后端，于Config文件夹中，且会自动加载
 * 自动加载的时候，会按照路径直到原始类型/数组逐一合并，如果类型/路径不匹配，则保持原值。
 * - 具有syncNow方法，可以立即同步
 * - 具有on_storage_load_complete方法，当存储加载完成时调用
 */
export function ConfigStoragePiniaPlugin({
    options,
    store,
}: PiniaPluginContext & { options: ConfigStorageOptions }) {
    const config = options.config_storage;
    if (
        !config ||
        !config.enabled ||
        !config.keys ||
        config.keys.length === 0 ||
        !config.keys.every((key) => store[key])
    ) {
        return;
    }
    const keys = config.keys;
    const throttle_time = config.throttle_ms || 300;
    const id = store.$id;
    const maxRetries = config.max_retries || 3;

    // 添加一个基于路径的安全合并函数
    function safeDeepMerge(target: any, source: any, path: string[] = []) {
        // 如果是基本类型或数组，检查source中对应路径的值
        if (typeof target !== "object" || Array.isArray(target)) {
            // 根据路径在source中查找对应值
            let sourceValue = source;
            for (const key of path) {
                if (sourceValue && typeof sourceValue === "object") {
                    sourceValue = sourceValue[key];
                } else {
                    return target; // 如果路径无效，保持原值
                }
            }

            // 只要路径有效且值不是undefined，就使用source中的值
            return sourceValue !== undefined ? sourceValue : target;
        }

        // 如果是对象，递归合并
        const result = { ...target };
        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                result[key] = safeDeepMerge(target[key], source, [
                    ...path,
                    key,
                ]);
            }
        }
        return result;
    }

    // 加载状态
    logger.info(
        `[Config Storage Pinia Plugin] 加载: ${id} keys: ${keys.join(", ")}`
    );
    invoke("load_content", { id: id, pluginType: PluginType.Official })
        .then((content) => {
            if (content) {
                // 遍历所有keys
                keys.forEach((key) => {
                    if (content[key]) {
                        // 使用基于路径的安全合并
                        const mergedData = safeDeepMerge(
                            store[key],
                            content[key]
                        );

                        // 更新store
                        if (
                            typeof store[key] === "object" &&
                            !Array.isArray(store[key])
                        ) {
                            Object.keys(store[key]).forEach((k) => {
                                store[key][k] = mergedData[k];
                            });
                        } else {
                            store[key] = mergedData;
                        }

                        logger.info(
                            `[Config Storage Pinia Plugin] 加载成功: ${id} key: ${key}`
                        );
                        ;
                    } else {
                        logger.warn(
                            `[Config Storage Pinia Plugin] 加载失败 属性不存在: ${id} key: ${key}`
                        );
                    }
                });
            }
        })
        .catch((err: ConfigErrorKind) => {
            logger.error(
                `[Config Storage Pinia Plugin] 加载失败: ${id} keys: ${keys.join(
                    ", "
                )}`,
                `err: ${err}`
            );
            // 强制保存一次，以便下次加载时可以加载
            store.syncNow();
        })
        .finally(() => {
            // 调用生命周期函数
            if (typeof options.on_storage_load_complete === "function") {
                options.on_storage_load_complete(store);
            }
        });

    // 调用Tauri后端本地化存储
    const storage_func = throttle(() => {
        let retryCount = 0;

        const attemptStorage = () => {
            const content = keys.reduce((acc, key) => {
                acc[key] = store[key];
                return acc;
            }, {} as Record<string, any>);

            invoke("storage_content", {
                id: id,
                content: content,
                pluginType: PluginType.Official,
            })
                .then(() => {
                    logger.trace(
                        `[Config Storage Pinia Plugin] 存储成功: ${id}`
                    );
                })
                .catch((error: ConfigErrorKind) => {
                    logger.warn(
                        `[Config Storage Pinia Plugin] 存储失败: ${id} ${error}`,
                        error
                    );
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        attemptStorage();
                    } else {
                        logger.error(
                            `[Config Storage Pinia Plugin] 达到最大重试次数: ${id} ${error}`
                        );
                    }
                });
        };

        attemptStorage();
    }, throttle_time);

    // 对所有keys进行监听
    const stopWatches = keys.map((key) =>
        watch(
            () => store[key],
            () => {
                storage_func();
            },
            { deep: true }
        )
    );

    store.$dispose = () => {
        // 停止所有监听
        stopWatches.forEach((stop) => stop());
        logger.info(
            `[Config Storage Pinia Plugin] 停止监听: ${id} keys: ${keys.join(
                ", "
            )}`
        );
    };

    // 注册syncNow方法
    store.syncNow = () => {
        storage_func();
        storage_func.flush();
    };

    logger.info(
        `[Config Storage Pinia Plugin] 监听: ${id} keys: ${keys.join(
            ", "
        )} 成功`
    );
}
