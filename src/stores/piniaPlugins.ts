/**
 * @fileOverview Pinia插件
 * @author erduotong
 */
import {PiniaPluginContext} from "pinia";

export interface StorageOptions {
    storage?: {
        enabled: boolean;
    };
}

export function StoragePiniaPlugin({
                                       options,
                                   }: PiniaPluginContext & { options: StorageOptions }) {
    const config = options.storage;
    if (!config) {
        return;
    }

}
