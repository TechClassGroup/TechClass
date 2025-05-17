/**
 * @fileOverview Pinia类型定义
 */
import "pinia";

declare module "pinia" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DefineStoreOptionsBase<S, Store> {
        config_storage?: {
            enabled: boolean;
            keys: string[];
            throttle_ms?: number;
            max_retries?: number;
        };
        on_storage_load_complete?: (store: Store) => void;
    }
}
