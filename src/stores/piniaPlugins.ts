/**
 * @fileOverview Pinia插件
 * @author erduotong
 */
import {PiniaPluginContext} from "pinia";
import {watch} from "vue";
import {throttle} from "lodash";

import {invoke} from "@tauri-apps/api/core";
import logger from "@/modules/logger.ts";

export interface ConfigStorageOptions {
    config_storage?: {
        enabled: boolean;
        key?: string; // 要监听的key
        throttle_ms?: number; // 延迟时间 以毫秒为单位
        max_retries?: number; // 最大重试次数
    };
    on_storage_load_complete?: () => void;
    syncNow?: () => void;
}

type ConfigErrorKind = {
    kind: IPCErrorKind.Io | IPCErrorKind.Json;
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
    if (!config || !config.enabled || !config.key || !store[config.key]) {
        return;
    }
    const key = config.key;
    const throttle_time = config.throttle_ms || 300;
    const id = store.$id;
    const maxRetries = config.max_retries || 3;

    // 添加一个基于路径的安全合并函数
    function safeDeepMerge(target: any, source: any, path: string[] = []) {
        // 如果是基本类型或数组，检查source中对应路径的值
        if (typeof target !== 'object' || Array.isArray(target)) {
            // 根据路径在source中查找对应值
            let sourceValue = source;
            for (const key of path) {
                if (sourceValue && typeof sourceValue === 'object') {
                    sourceValue = sourceValue[key];
                } else {
                    return target; // 如果路径无效，保持原值
                }
            }
            
            // 检查类型是否匹配
            if (typeof sourceValue === typeof target || 
                (Array.isArray(target) && Array.isArray(sourceValue))) {
                return sourceValue;
            }
            return target; // 类型不匹配时保持原值
        }
        
        // 如果是对象，递归合并
        const result = { ...target };
        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                result[key] = safeDeepMerge(
                    target[key], 
                    source, 
                    [...path, key]
                );
            }
        }
        return result;
    }

    // 加载状态
    logger.info(`[Config Storage Pinia Plugin] 加载: ${id} key: ${key}`);
    invoke("load_content", {id})
        .then((content) => {
            if (content && content[key]) {
                // 使用基于路径的安全合并
                const mergedData = safeDeepMerge(store[key], content[key]);
                
                // 更新store
                Object.keys(store[key]).forEach(k => {
                    store[key][k] = mergedData[k];
                });

                logger.info(
                    `[Config Storage Pinia Plugin] 加载成功: ${id} key: ${key}`
                );
                if (typeof options.on_storage_load_complete === "function") {
                    options.on_storage_load_complete();
                }
            } else {
                logger.warn(
                    `[Config Storage Pinia Plugin] 加载失败 属性不存在: ${id} key: ${key}`
                );
            }
        })
        .catch((err: ConfigErrorKind) => {
            logger.error(
                `[Config Storage Pinia Plugin] 加载失败: ${id} key: ${key}`,
                err
            );
            // 强制保存一次，以便下次加载时可以加载
            store.syncNow();

        });

    // 调用Tauri后端本地化存储，如果失败则重试。达到重试次数后，不再递归。等到下一次状态变化后再尝试
    const storage_func = throttle((content: any) => {
        let retryCount = 0;

        const attemptStorage = () => {
            invoke("storage_content", {
                id,
                content: {
                    [key]: content,
                },
            })
                .then(() => {
                    logger.trace(`[Config Storage Pinia Plugin] 存储成功: ${id} `);
                })
                .catch((error: ConfigErrorKind) => {
                    logger.warn(`[Config Storage Pinia Plugin] 存储失败: ${id}`, error);
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        attemptStorage();
                    } else {
                        logger.error(
                            `[Config Storage Pinia Plugin] 达到最大重试次数: ${id}`
                        );
                    }
                });
        };

        attemptStorage();
    }, throttle_time);
    // 对其进行监听
    const stopWatch = watch(
        () => store[key],
        (newContent) => {
            storage_func(newContent);
        },
        {deep: true}
    );
    store.$dispose = () => {
        // 别忘了在store销毁时停止监听
        stopWatch();
        logger.info(`[Config Storage Pinia Plugin] 停止监听: ${id} key: ${key}`);
    };

    // 注册两个方法 允许立即同步和加载回调
    store.syncNow = () => {

        storage_func(store[key]);
        storage_func.flush();
    };

    logger.info(`[Config Storage Pinia Plugin] 监听: ${id} key: ${key} 成功`);
}
