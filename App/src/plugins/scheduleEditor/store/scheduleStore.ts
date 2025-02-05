import {ScheduleEditorProfileStore} from "../scheduleEditorTypes";
import {PluginStore} from "../../../types/plugins";
import {PluginFs} from "../../../modules/pluginUtils";
import {clear, init, scheduleEditorProfile} from "./scheduleEditorProfile";


export let scheduleEditorStore: PluginStore | null = null;


// 初始化和清理函数
export function initializeStore(store: PluginStore, fs: PluginFs) {
    scheduleEditorStore = store;
    init(fs)
}

export function clearStore() {
    scheduleEditorProfile.value = {} as ScheduleEditorProfileStore;
    scheduleEditorStore = null;
    clear();
}
