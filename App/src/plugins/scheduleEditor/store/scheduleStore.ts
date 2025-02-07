import {ScheduleEditorProfileStore} from "../scheduleEditorTypes";
import {PluginStore} from "../../../types/plugins";
import {PluginFs} from "../../../modules/pluginUtils";
import {clearProfile, initProfile, scheduleEditorProfile} from "./scheduleEditorProfile";


export let scheduleEditorStore: PluginStore | null = null;


// 初始化和清理函数
export function initializeStore(store: PluginStore, fs: PluginFs) {
    scheduleEditorStore = store;
    initProfile(fs)
}

export function clearStore() {
    scheduleEditorProfile.value = {} as ScheduleEditorProfileStore;
    scheduleEditorStore = null;
    clearProfile();
}
