import {ScheduleEditorProfileStore} from "../scheduleEditorTypes";
import {PluginStore} from "../../../types/plugins";
import {PluginFs} from "../../../modules/pluginUtils";
import {clearProfile, initProfile, scheduleEditorProfile} from "./scheduleEditorProfile";
import {clearTodayConfig, initTodayConfig} from "./todayConfigStore";


export let scheduleEditorStore: PluginStore | null = null;


// 初始化和清理函数
export function initializeStore(store: PluginStore, fs: PluginFs) {
    scheduleEditorStore = store;
    initProfile(fs).then() //这个函数实际上是同步的
    initTodayConfig().then()
}

export function clearStore() {
    scheduleEditorProfile.value = {} as ScheduleEditorProfileStore;
    scheduleEditorStore = null;
    clearProfile();
    clearTodayConfig()
}
