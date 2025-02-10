/**
 * @fileOverview 一些工具函数
 */

import Logger from "./logger";
import {DateTime} from "luxon";

/**
 * 创建一个具有重试机制的保存函数
 * @param saveAction 需要执行的保存操作函数，返回Promise
 * @param options 配置选项
 * @returns 包装后的保存函数
 */
export function createRetrySaveFunction<T>(
    saveAction: () => Promise<T>,
    options?: {
        maxRetries?: number;
        onSuccess?: () => void;
        onError?: (error: any) => void;
        onRetry?: (retryCount: number, maxRetries: number, error: any) => void;
    }
) {
    let isSaving = false;
    let hasPending = false;

    return function executeSave() {
        if (isSaving) {
            hasPending = true;
            return;
        }

        isSaving = true;
        let retryCount = 0;
        const maxRetries = options?.maxRetries ?? 5;

        function attemptSave() {
            saveAction()
                .then(() => {
                    options?.onSuccess?.();
                    isSaving = false;
                    if (hasPending) {
                        hasPending = false;
                        executeSave();
                    }
                })
                .catch((error) => {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        options?.onRetry?.(retryCount, maxRetries, error);
                        attemptSave();
                    } else {
                        options?.onError?.(error);
                        isSaving = false;
                        if (hasPending) {
                            hasPending = false;
                            executeSave();
                        }
                    }
                });
        }

        attemptSave();
    };
}

/**
 * 创建一个带prefix的Logger
 */
export class createLogger {
    private readonly prefix: string;

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    trace(...args: any[]) {
        Logger.trace(this.prefix, ...args);
    }

    debug(...args: any[]) {
        Logger.debug(this.prefix, ...args);
    }

    info(...args: any[]) {
        Logger.info(this.prefix, ...args);
    }

    warn(...args: any[]) {
        Logger.warn(this.prefix, ...args);
    }

    error(...args: any[]) {
        Logger.error(this.prefix, ...args);
    }
}

/**
 * 等待到指定时间
 * @param time 目标时间
 * @param interval_ms 检查间隔时间，默认1000ms
 */
export async function sleepUntil(
    time: DateTime,
    interval_ms: number = 1000
): Promise<void> {
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const now = DateTime.now();
            if (now >= time) {
                clearInterval(intervalId);
                resolve();
            }
        }, interval_ms);
    });
}

