import {ScheduleEditorProfileStore} from "../scheduleEditor.types";

import {clearProfile, initProfile, scheduleEditorProfile} from "./scheduleEditorProfile";
import {clearTodayConfig, initTodayConfig} from "./todayConfigStore";
import {localFileSystem} from "../../../core/plugins-systems/pluginApis/fileSystem";
import {manifest} from "../scheduleEditor";


// 初始化和清理函数
export function initializeStore() {
    const fs = new localFileSystem(manifest.id, true);
    initProfile(fs).then() //这个函数实际上是同步的
    initTodayConfig(fs).then()
}

export function clearStore() {
    scheduleEditorProfile.value = {} as ScheduleEditorProfileStore;
    clearProfile();
    clearTodayConfig()
}
