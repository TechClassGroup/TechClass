/**
 * @fileOverview 档案的store
 */
import {ScheduleEditorStore} from "../scheduleEditorTypes";
import logger from "../../../modules/logger";
import {PluginFs} from "../../../modules/pluginUtils";
import {DateTime} from "luxon";
import {ref, watch} from "vue";
import {throttle} from "lodash";


export const scheduleEditorProfile = ref<ScheduleEditorStore>(
    {} as ScheduleEditorStore
);


let fileSystem: PluginFs | null = null;
const scheduleEditorStoreProfileName: string = "scheduleEditor.profile.json";
let profileWatcher: null | ReturnType<typeof watch> = null;


function createScheduleEditorProfile(): ScheduleEditorStore {
    return {
        subjects: {},
        timetables: {},
        curriculums: {},
        timeGroups: {},
    };
}

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

export function init(fs: PluginFs) {
    fileSystem = fs;
    scheduleEditorProfile.value = createScheduleEditorProfile();
    fs.readFile(scheduleEditorStoreProfileName)
        .then((data) => {
            try {
                const profile = JSON.parse(data);
                // 处理 DateTime 的反序列化
                scheduleEditorProfile.value = deserializeDateTime(profile);
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
    profileWatcher = watch(
        scheduleEditorProfile,
        () => {

            const saveProfileThrottled = throttle(saveProfile, 300);
            saveProfileThrottled();
        },
        {deep: true}
    );
}

export function clear() {
    saveProfile();
}