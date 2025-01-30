/**
 * @fileOverview Pinia类型定义
 */
declare module "pinia" {
    // noinspection JSUnusedGlobalSymbols
    export interface DefineStoreOptionsBase<S, Store> {
        config_storage?: {
            enabled: boolean;
            keys: string[];
            throttle_ms: number;
            max_retries?: number;
        };
        on_storage_load_complete?: (store: Store) => void;
    }
}
