/**
 * @fileOverview 日志模块
 */
import { invoke } from "@tauri-apps/api/core";

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

/**
 * 日志模块 提供了五个级别的日志输出 输出到rust终端 前端没有
 */
class Logger {
    trace(...args: any[]) {
        if (__LOG_LEVEL_TRACE__) {
            const message = args.map((arg) => JSON.stringify(arg)).join(" ");
            invoke(LoggerType.trace, { content: message }).then();
        }
    }

    debug(...args: any[]) {
        if (__LOG_LEVEL_DEBUG__) {
            const message = args.map((arg) => JSON.stringify(arg)).join(" ");
            invoke(LoggerType.debug, { content: message }).then();
        }
    }

    info(...args: any[]) {
        if (__LOG_LEVEL_INFO__) {
            const message = args.map((arg) => JSON.stringify(arg)).join(" ");
            invoke(LoggerType.info, { content: message }).then();
        }
    }

    warn(...args: any[]) {
        if (__LOG_LEVEL_WARN__) {
            const message = args.map((arg) => JSON.stringify(arg)).join(" ");
            invoke(LoggerType.warn, { content: message }).then();
        }
    }

    error(...args: any[]) {
        if (__LOG_LEVEL_ERROR__) {
            const message = args.map((arg) => JSON.stringify(arg)).join(" ");
            invoke(LoggerType.error, { content: message }).then();
        }
    }
}

export default new Logger();
