/**
 * @fileOverview 今日课程配置
 */
import {ScheduleEditorProfileStore, todayConfig,} from "../scheduleEditorTypes";
import {DateTime} from "luxon";

import {CurriculumResult, processTimeGroupWithResult, TimeGroupInfo,} from "./timeGroupProcessor";
import {scheduleEditorLogger} from "./utils";

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
        schedule: [],
    };
    if (!curriculum.curriculum) {
        scheduleEditorLogger.info(
            "[generateSchedule] 今日无课程表", curriculum
        );
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
    Object.entries(timetable.layouts).forEach(([layoutId, layout]) => {
        let name: string = "";
        let shortName: string = "";
        let teacherName: string = "";
        if (layout.type === "break") {
            name = layout.breakName;
        } else {
            // 判断classes里面timeId为layoutId的subjectId是否为空
            const currentClass = classes.find(
                (item) => item.timeId === layoutId
            );
            if (!currentClass) {
                scheduleEditorLogger.warn(
                    "[generateSchedule] 未找到课程" + layoutId
                );
                return
            }
            if (currentClass.subjectId && currentClass.subjectId !== "") {
                // 有指定的情况
                const subject = profile.subjects[currentClass.subjectId];
                if (!subject) {
                    scheduleEditorLogger.warn(
                        "[generateSchedule] 未找到课程" +
                        currentClass.subjectId
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
                        "[generateSchedule] 未找到课程" +
                        currentClass.subjectId)
                    return;
                }
                name = subject.name;
                shortName = subject.shortName;
                teacherName = subject.teacherName;

            }
        }

        result.schedule.push({
            name: name,
            shortName: shortName,
            teacherName: teacherName,
            startTime: layout.startTime,
            endTime: layout.endTime,
            noDisplayedSeparately: layout.noDisplayedSeparately,
        });
    });
    result.schedule.sort((a, b) => a.startTime > b.startTime ? 1 : -1);
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
