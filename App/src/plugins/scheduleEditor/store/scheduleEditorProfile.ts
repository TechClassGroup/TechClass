/**
 * @fileOverview 档案的store
 */
import {ScheduleEditorProfileStore} from "../scheduleEditor.types";
import logger from "../../../core/utils/logger";

import {DateTime} from "luxon";
import {ref, watch} from "vue";
import {throttle} from "lodash";
import {createRetrySaveFunction} from "../../../core/utils/utils";
import {localFileSystem} from "../../../core/plugins-systems/pluginApis/fileSystem";

export const scheduleEditorProfile = ref<ScheduleEditorProfileStore>(
    {} as ScheduleEditorProfileStore
);

let fileSystem: localFileSystem | null = null;
const scheduleEditorStoreProfileName: string =
    "profiles/scheduleEditor.profile.json";
let profileWatcher: null | ReturnType<typeof watch> = null;
let initPromise: Promise<void> | null = null;

function createScheduleEditorProfile(): ScheduleEditorProfileStore {
    return {
        subjects: {},
        timetables: {},
        curriculums: {},
        timeGroups: {},
        enableConfig: {
            selected: {
                type: "timegroup",
                id: "",
            },
            tempSelected: {
                enable: false,
                type: "curriculum",
                id: "",
                startTime: DateTime.local(),
                endTime: DateTime.local(),
            },
        },
    };
}

const saveProfile = createRetrySaveFunction(
    () =>
        fileSystem!.writeFile(
            scheduleEditorStoreProfileName,
            JSON.stringify(scheduleEditorProfile.value)
        ),
    {
        onSuccess: () => {
            logger.trace("[scheduleEditor] 保存档案数据成功");
        },
        onRetry: (retryCount, maxRetries, error) => {
            logger.warn(
                `[scheduleEditor] 保存档案数据失败,正在重试(${retryCount}/${maxRetries})`,
                error
            );
        },
        onError: (error) => {
            logger.error(`[scheduleEditor] 保存档案数据失败,已重试5次`, error);
        },
    }
);

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
    // 处理 enableConfig 中的 DateTime
    if (profile.enableConfig.tempSelected.startTime) {
        profile.enableConfig.tempSelected.startTime = DateTime.fromISO(
            profile.enableConfig.tempSelected.startTime
        );
    }
    if (profile.enableConfig.tempSelected.endTime) {
        profile.enableConfig.tempSelected.endTime = DateTime.fromISO(
            profile.enableConfig.tempSelected.endTime
        );
    }
    return profile;

}

export function initProfile(fs: localFileSystem) {
    fileSystem = fs;
    scheduleEditorProfile.value = createScheduleEditorProfile();

    initPromise = fs
        .readFile(scheduleEditorStoreProfileName)
        .then((data) => {
            try {
                const profile = JSON.parse(data);

                // 检查并确保所有顶层key存在
                const defaultProfile = createScheduleEditorProfile();
                const requiredKeys = Object.keys(defaultProfile);

                requiredKeys.forEach((key) => {
                    if (!profile[key]) {
                        profile[key] = defaultProfile[key];
                        logger.warn(
                            `[scheduleEditor] 档案数据缺少 ${key}，已自动创建`
                        );
                    }
                }); // 处理 DateTime 的反序列化
                scheduleEditorProfile.value = deserializeDateTime(profile);
                logger.trace("[scheduleEditor] 档案数据加载成功");
            } catch (error) {
                logger.error("[scheduleEditor] 解析档案数据失败", error);
                // 如果解析失败，保持使用默认的配置文件
                return saveProfile();
            }
        })
        .catch((e) => {
            logger.error("[scheduleEditor] 读取档案数据失败", e);
            return saveProfile(); // 立刻保存一次全新的档案
        })
        .finally(() => {
            initPromise = null;
        });

    profileWatcher = watch(
        scheduleEditorProfile,
        () => {
            const saveProfileThrottled = throttle(saveProfile, 300);
            saveProfileThrottled();
        },
        {deep: true}
    );

    return initPromise;
}

export function waitForInit(): Promise<void> {
    return initPromise || Promise.resolve();
}

export function clearProfile() {
    saveProfile();
    profileWatcher?.stop();
    scheduleEditorProfile.value = {} as ScheduleEditorProfileStore;
}
