import {ref, watch} from "vue";
import {DateTime} from "luxon";
import {ScheduleEditorStore} from "./scheduleEditorTypes";
import {PluginStore} from "../../types/plugins";
import {PluginFs} from "../../modules/pluginUtils";
import logger from "../../modules/logger";
import {throttle} from "lodash";

function createScheduleEditorProfile(): ScheduleEditorStore {
    // 测试数据
    return {
        subjects: {},
        timetables: {},
        curriculums: {},
        timeGroups: {},
    };
}

// 创建响应式状态
export const scheduleEditorProfile = ref<ScheduleEditorStore>(
    {} as ScheduleEditorStore
);
export let scheduleEditorStore: PluginStore | null = null;
let fileSystem: PluginFs | null = null;
let profileWatcher: null | ReturnType<typeof watch> = null;
const scheduleEditorStoreProfileName: string = "scheduleEditor.profile.json";

const saveProfile = (function () {
    let isSavingProfile = false;
    let hasPendingSave = false;

    return function () {
        if (!fileSystem) {
            logger.warn("[scheduleEditor] 无法保存档案数据，文件系统未初始化");
            return;
        }

        if (isSavingProfile) {
            logger.trace("[scheduleEditor] 已有保存操作在进行中，标记为待保存");
            hasPendingSave = true;
            return;
        }

        isSavingProfile = true;
        let retryCount = 0;
        const maxRetries = 5;
        const data = JSON.stringify(scheduleEditorProfile.value);

        function attemptSave() {
            fileSystem
                ?.writeFile(scheduleEditorStoreProfileName, data)
                .then(() => {
                    logger.trace("[scheduleEditor] 保存档案数据成功");
                    isSavingProfile = false;
                    if (hasPendingSave) {
                        hasPendingSave = false;
                        logger.trace("[scheduleEditor] 执行待保存的操作");
                        saveProfile();
                    }
                })
                .catch((e) => {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        logger.warn(
                            `[scheduleEditor] 保存档案数据失败,正在重试(${retryCount}/${maxRetries})`,
                            e
                        );
                        attemptSave();
                    } else {
                        logger.error(
                            `[scheduleEditor] 保存档案数据失败,已重试${maxRetries}次`,
                            e
                        );
                        isSavingProfile = false;
                        if (hasPendingSave) {
                            hasPendingSave = false;
                            logger.trace("[scheduleEditor] 执行待保存的操作");
                            saveProfile();
                        }
                    }
                });
        }

        attemptSave();
    };
})();

function deserializeDateTime(profile: any) {
    // 处理 timetables 中的 DateTime
    Object.values(profile.timetables).forEach((timetable: any) => {
        Object.values(timetable.layouts).forEach((layout: any) => {
            if (layout.startTime) {
                layout.startTime = DateTime.fromISO(layout.startTime);
            }
            if (layout.endTime) {
                layout.endTime = DateTime.fromISO(layout.endTime);
            }
        });
    });

    // 处理 timeGroups 中的 DateTime
    Object.values(profile.timeGroups).forEach((timeGroup: any) => {
        if (timeGroup.startTime) {
            timeGroup.startTime = DateTime.fromISO(timeGroup.startTime);
        }
    });

    return profile;
}

// 初始化和清理函数
export function initializeStore(store: PluginStore, fs: PluginFs) {
    scheduleEditorProfile.value = createScheduleEditorProfile();
    scheduleEditorStore = store;
    fileSystem = fs;
    fs.readFile(scheduleEditorStoreProfileName)
        .then((data) => {
            try {
                const profile = JSON.parse(data);
                // 处理 DateTime 的反序列化
                const deserializedProfile = deserializeDateTime(profile);
                scheduleEditorProfile.value = deserializedProfile;
                console.log(scheduleEditorProfile.value);
                logger.trace("[scheduleEditor] 档案数据加载成功");
            } catch (error) {
                logger.error("[scheduleEditor] 解析档案数据失败", error);
                // 如果解析失败，保持使用默认的配置文件
                saveProfile();
            }
        })
        .catch((e) => {
            logger.error("[scheduleEditor] 读取档案数据失败", e);
            saveProfile(); // 立刻保存一次全新的档案
        });
    const saveProfileThrottled = throttle(saveProfile, 300);
    profileWatcher = watch(
        scheduleEditorProfile,
        () => {
            saveProfileThrottled();
        },
        {deep: true}
    );
}

export function clearStore() {
    saveProfile();
    scheduleEditorProfile.value = {} as ScheduleEditorStore;
    scheduleEditorStore = null;
    fileSystem = null;
}
