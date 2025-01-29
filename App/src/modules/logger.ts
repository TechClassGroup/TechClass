/**
 * @fileOverview 日志模块
 */
import {invoke} from "@tauri-apps/api/core";

enum LoggerType {
    trace = "log_trace",
    debug = "log_debug",
    info = "log_info",
    warn = "log_warn",
    error = "log_error",
}

// 声明编译时常量
declare const __LOG_LEVEL_TRACE__: boolean;
declare const __LOG_LEVEL_DEBUG__: boolean;
declare const __LOG_LEVEL_INFO__: boolean;
declare const __LOG_LEVEL_WARN__: boolean;
declare const __LOG_LEVEL_ERROR__: boolean;
declare const __IS_DEV__: boolean;
/**
 * 深度序列化对象，处理特殊情况
 */
function serializeForLog(value: any, seen = new WeakSet()): any {
    // 处理基本类型
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value !== 'object') return value;

    // 处理循环引用
    if (seen.has(value)) {
        return '[Circular Reference]';
    }
    seen.add(value);

    // 处理特殊对象
    if (value instanceof Error) {
        return {
            _type: 'Error',
            name: value.name,
            message: value.message,
            stack: value.stack
        };
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (value instanceof RegExp) {
        return value.toString();
    }

    if (Array.isArray(value)) {
        return value.map(item => serializeForLog(item, seen));
    }

    // 处理普通对象
    const result: Record<string, any> = {};
    for (const key of Object.keys(value)) {
        try {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (descriptor && descriptor.get) {
                result[key] = '[Getter]';
            } else if (descriptor && descriptor.set) {
                result[key] = '[Setter]';
            } else {
                const val = value[key];
                if (typeof val === 'function') {
                    result[key] = `[Function: ${val.name || 'anonymous'}]`;
                } else {
                    result[key] = serializeForLog(val, seen);
                }
            }
        } catch (e) {
            result[key] = '[Unable to serialize]';
        }
    }

    return result;
}

/**
 * 日志模块 提供了五个级别的日志输出 输出到rust终端 前端没有
 */
class Logger {
    private formatLogMessage(...args: any[]): string {
        return args.map(arg => {
            try {
                const serialized = serializeForLog(arg);
                return typeof serialized === 'string' ?
                    serialized :
                    JSON.stringify(serialized, null, 2);
            } catch (err) {
                return String(arg);
            }
        }).join(' ');
    }

    trace(...args: any[]) {

        if (__LOG_LEVEL_TRACE__) {
            invoke(LoggerType.trace, {content: this.formatLogMessage(...args)}).then();
        }
    }

    debug(...args: any[]) {
        if (__LOG_LEVEL_DEBUG__) {
            invoke(LoggerType.debug, {content: this.formatLogMessage(...args)}).then();
        }
    }

    info(...args: any[]) {
        if (__LOG_LEVEL_INFO__) {
            invoke(LoggerType.info, {content: this.formatLogMessage(...args)}).then();
        }
    }

    warn(...args: any[]) {
        if (__LOG_LEVEL_WARN__) {
            invoke(LoggerType.warn, {content: this.formatLogMessage(...args)}).then();
        }
    }

    error(...args: any[]) {
        if (__LOG_LEVEL_ERROR__) {
            invoke(LoggerType.error, {content: this.formatLogMessage(...args)}).then();
        }
    }
}

export default new Logger();
