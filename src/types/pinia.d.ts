import { StorageOptions } from "@/stores/piniaPlugins";

/**
 * @fileOverview Pinia类型定义
 */
declare module "pinia" {
    // noinspection JSUnusedGlobalSymbols
    export interface DefineStoreOptionsBase<S, Store>  extends StorageOptions {}
} 