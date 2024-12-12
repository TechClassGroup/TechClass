/**
 * @fileOverview Pinia插件
 * @author erduotong
 */
import {PiniaPluginContext} from "pinia";

export interface ConfigStorageOptions {
    config_storage?: {
        enabled: boolean;
        key?: string | string[]; // 要监听的key
    };
}

type ConfigErrorKind = {
    kind: IPCErrorKind.Io | IPCErrorKind.Json;
    message: string;
}

export function ConfigStoragePiniaPlugin({
                                             options,
                                         }: PiniaPluginContext & { options: ConfigStorageOptions }) {
    const config = options.config_storage
    if (!config || !config.enabled || !config.key) {
        return;
    }



}
