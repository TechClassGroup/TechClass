/**
 * @fileOverview 今日课程配置
 */
import {ScheduleEditorProfileStore, todayConfig,} from "../scheduleEditorTypes";
import {DateTime} from "luxon";

import {CurriculumResult, processTimeGroupWithResult} from "./timeGroupProcessor";
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
            scheduleEditorLogger.warn("[findTodayCurriculum] 临时配置时间范围未设置");
            return false;
        }
        // 判断是否在时间范围内
        const inRange =
            profile.enableConfig.tempSelected.startTime.startOf("day") <=
            targetDate &&
            profile.enableConfig.tempSelected.endTime.startOf("day") >=
            targetDate;

        scheduleEditorLogger.trace("[findTodayCurriculum] 临时配置时间范围检查", {
            inRange,
            startTime: profile.enableConfig.tempSelected.startTime.toISO(),
            endTime: profile.enableConfig.tempSelected.endTime.toISO(),
        });
        return inRange;
    })();

    let type: "curriculum" | "timegroup";
    let id: string;
    if (isTemp) {
        type = profile.enableConfig.tempSelected.type;
        id = profile.enableConfig.tempSelected.id;
        scheduleEditorLogger.debug("[scheduleEditor] 使用临时配置", {type, id});
    } else {
        type = profile.enableConfig.selected.type;
        id = profile.enableConfig.selected.id;
        scheduleEditorLogger.debug("[scheduleEditor] 使用默认配置", {type, id});
    }

    // 根据ID查找
    if (type == "timegroup") {
        scheduleEditorLogger.debug("[findTodayCurriculum] 处理时间组", {groupId: id});
        return processTimeGroupWithResult(
            targetDate,
            profile.timeGroups[id],
            profile,
            id
        );
    } else {
        scheduleEditorLogger.debug("[findTodayCurriculum] 返回课表", {curriculumId: id});
        return {
            curriculum: profile.curriculums[id],
            followTimeGroups: [],
            isLoop: false,
        };
    }
}

export function generateTodayConfig(
    date: DateTime,
    profile: ScheduleEditorProfileStore
): todayConfig {
    const targetDate = date.startOf("day");
    const result = {
        schedule: [],
        generateDate: DateTime.now(),
    };
    findTodayCurriculum(targetDate, profile);

    return result;
}
