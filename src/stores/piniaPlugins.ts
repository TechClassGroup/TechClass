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
}

type ConfigErrorKind = {
    kind: IPCErrorKind.Io | IPCErrorKind.Json;
};

export function ConfigStoragePiniaPlugin({
                                             options,
                                             store,
                                         }: PiniaPluginContext & { options: ConfigStorageOptions }) {
    const config = options.config_storage;
    if (!config || !config.enabled || !config.key) {
        return;
    }
    const key = config.key;

    const throttle_time = config.throttle_ms || 300;
    const id = store.$id;

    const maxRetries = config.max_retries || 3;
    // 调用Tauri后端本地化存储，如果失败则重试。达到重试次数后，不再递归。等到下一次状态变化后再尝试
    const storage_func = throttle((content: any) => {
        let retryCount = 0;

        const attemptStorage = () => {
            invoke("storage_content", {
                id,
                content: {
                    [id]: content,
                },
            })
                .then(() => {
                    logger.trace(`[Config Storage Pinia Plugin] 存储成功: ${id}`);
                })
                .catch((error: ConfigErrorKind) => {
                    logger.warn(`[Config Storage Pinia Plugin] 存储失败: ${id}`, error);
                    retryCount++;
                    if (retryCount <= maxRetries) {
                        attemptStorage();
                    } else {
                        logger.error(`[Config Storage Pinia Plugin] 达到最大重试次数: ${id}`);
                    }
                });
        };

        attemptStorage();
    }, throttle_time);

    watch(
        () => store[key],
        (newContent) => {
            storage_func(newContent);
        },
        {deep: true}
    );
    logger.info(`[Config Storage Pinia Plugin] 监听: ${id} key: ${key} 成功`);
}
