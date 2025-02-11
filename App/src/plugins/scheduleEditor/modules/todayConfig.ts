/**
 * @fileOverview 今日课程配置
 */
import {ScheduleEditorProfileStore, todayConfig,} from "../scheduleEditorTypes";
import {DateTime} from "luxon";
import {v4 as uuidv4} from "uuid";

import {CurriculumResult, processTimeGroupWithResult, TimeGroupInfo,} from "./timeGroupProcessor";
import {scheduleEditorLogger} from "./utils";
import logger from "../../../modules/logger";

function findTodayCurriculum(
    targetDate: DateTime,
    profile: ScheduleEditorProfileStore
): CurriculumResult {
    scheduleEditorLogger.debug("[findTodayCurriculum] 开始查找今日课程", {
        date: targetDate.toISO(),
    });

    const isTemp = (() => {
        if (!profile.enableConfig.tempSelected.enable) {
            scheduleEditorLogger.trace("[findTodayCurriculum] 临时配置未启用");
            return false;
        }
        if (
            !profile.enableConfig.tempSelected.startTime ||
            !profile.enableConfig.tempSelected.endTime
        ) {
            scheduleEditorLogger.warn(
                "[findTodayCurriculum] 临时配置时间范围未设置"
            );
            return false;
        }
        // 判断是否在时间范围内
        const inRange =
            profile.enableConfig.tempSelected.startTime.startOf("day") <=
            targetDate &&
            profile.enableConfig.tempSelected.endTime.startOf("day") >=
            targetDate;

        scheduleEditorLogger.trace(
            "[findTodayCurriculum] 临时配置时间范围检查",
            {
                inRange,
                startTime: profile.enableConfig.tempSelected.startTime.toISO(),
                endTime: profile.enableConfig.tempSelected.endTime.toISO(),
            }
        );
        return inRange;
    })();

    let type: "curriculum" | "timegroup";
    let id: string;
    if (isTemp) {
        type = profile.enableConfig.tempSelected.type;
        id = profile.enableConfig.tempSelected.id;
        scheduleEditorLogger.debug("[scheduleEditor] 使用临时配置", {
            type,
            id,
        });
    } else {
        type = profile.enableConfig.selected.type;
        id = profile.enableConfig.selected.id;
        scheduleEditorLogger.debug("[scheduleEditor] 使用默认配置", {
            type,
            id,
        });
    }

    // 根据ID查找
    if (type == "timegroup") {
        scheduleEditorLogger.debug("[findTodayCurriculum] 处理时间组", {
            groupId: id,
        });
        return processTimeGroupWithResult(
            targetDate,
            profile.timeGroups[id],
            profile,
            id
        );
    } else {
        scheduleEditorLogger.debug("[findTodayCurriculum] 返回课表", {
            curriculumId: id,
        });
        return {
            curriculum: profile.curriculums[id],
            followTimeGroups: [],
            isLoop: false,
        };
    }
}

function generateSchedule(
    targetDate: DateTime,
    profile: ScheduleEditorProfileStore,
    curriculum: CurriculumResult
): todayConfig {
    const result: todayConfig = {
        generateDate: DateTime.now(),
        schedule: {},
    };
    if (!curriculum.curriculum) {
        scheduleEditorLogger.info("[generateSchedule] 今日无课程表");
        scheduleEditorLogger.debug("课程表信息", curriculum);
        return result;
    }

    const curriculumData = curriculum.curriculum;
    const timetable = profile.timetables[curriculumData.timetableId];
    const classes = curriculumData.classes;

    if (!timetable) {
        scheduleEditorLogger.warn(
            "[generateSchedule] 未找到时间表" + curriculumData.timetableId
        );
        return result;
    }

    const usedUuids = new Set();

    Object.entries(timetable.layouts).forEach(([layoutId, layout]) => {
        let uuid = uuidv4();
        while (usedUuids.has(uuid)) {
            uuid = uuidv4();
        }
        usedUuids.add(uuid);
        const startTime = DateTime.now().set({
            hour: layout.startTime.hour,
            minute: layout.startTime.minute,
            second: 0,
            millisecond: 0,
        })
        if (layout.type === "break") {

            result.schedule[uuid] = {
                type: "break",
                startTime: startTime,
                endTime: DateTime.now().set({
                    hour: layout.endTime.hour,
                    minute: layout.endTime.minute,
                    second: 0,
                    millisecond: 0,
                }),
                name: layout.breakName,
                noDisplayedSeparately: layout.noDisplayedSeparately,
                shortName: "", // 等一会再说
            }
            return;
        }
        if (layout.type === "lesson") {
            // 判断classes里面timeId为layoutId的subjectId是否为空
            const currentClass = classes.find(
                (item) => item.timeId === layoutId
            );
            if (!currentClass) {
                scheduleEditorLogger.warn(
                    "[generateSchedule] 未找到课程" + layoutId
                );
                return;
            }
            let name: string
            let shortName: string
            let teacherName: string
            if (currentClass.subjectId && currentClass.subjectId !== "") {
                // 有指定的情况
                const subject = profile.subjects[currentClass.subjectId];
                if (!subject) {
                    scheduleEditorLogger.warn(
                        "[generateSchedule] 未找到课程" + currentClass.subjectId
                    );
                    return;
                }
                name = subject.name;
                shortName = subject.shortName;
                teacherName = subject.teacherName;
            } else {
                // 没有指定的情况
                const subject = profile.subjects[layout.subjectId];
                if (!subject) {
                    scheduleEditorLogger.warn(
                        "[generateSchedule] 未找到课程" + currentClass.subjectId
                    );
                    return;
                }
                name = subject.name;
                shortName = subject.shortName;
                teacherName = subject.teacherName;
            }
            result.schedule[uuid] = {
                type: "lesson",
                startTime: startTime,
                endTime: DateTime.now().set({
                    hour: layout.endTime.hour,
                    minute: layout.endTime.minute,
                    second: 0,
                    millisecond: 0,
                }),
                name: name,
                shortName: shortName,
                teacherName: teacherName,
                noDisplayedSeparately: layout.noDisplayedSeparately,
            }
            return
        }
        if (layout.type === "dividingLine") {
            result.schedule[uuid] = {
                type: "dividingLine",
                startTime: startTime,
            }
            return;
        }
        logger.error("未知的layout类型", layout);


    });

    return result;
}

interface todayConfigResult {
    isLoop: boolean;
    // if isLoop == false
    value: todayConfig | null;
    // if isLoop == true
    followTimeGroups: TimeGroupInfo[];
}

export function generateTodayConfigByDate(
    date: DateTime,
    profile: ScheduleEditorProfileStore
): todayConfigResult {
    const targetDate = date.startOf("day");

    const curriculum = findTodayCurriculum(targetDate, profile);
    // 循环的话，就没什么好处理的了 直接走
    if (curriculum.isLoop) {
        return {
            isLoop: true,
            value: null,
            followTimeGroups: curriculum.followTimeGroups,
        };
    }
    const result = generateSchedule(targetDate, profile, curriculum);
    return {
        isLoop: false,
        value: result,
        followTimeGroups: curriculum.followTimeGroups,
    };
}
