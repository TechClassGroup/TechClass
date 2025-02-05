/**
 * @fileOverview 今日课程配置
 */
import {Curriculum, ScheduleEditorProfileStore, TimeGroup, todayConfig,} from "../scheduleEditorTypes";
import {DateTime} from "luxon";
import Logger from "../../../modules/logger";

interface curriculumResult {
    /**
     * 目标的课表
     */
    curriculum: Curriculum | undefined;
    /**
     * 途径的时间组
     */
    followTimeGroups: TimeGroup[];
}

function handleTimeGroup(
    targetDate: DateTime,
    timeGroup: TimeGroup
): curriculumResult {
    let startTime: DateTime | null = null;
    const followTimeGroups: TimeGroup[] = [];
    let curriculum: Curriculum | undefined = undefined;

    function _find(currentTimeGroup: TimeGroup) {

    }

    _find(timeGroup);
    return {
        curriculum,
        followTimeGroups,
    };
}
function findTodayCurriculum(
    targetDate: DateTime,
    profile: ScheduleEditorProfileStore
): curriculumResult {
    Logger.debug("[findTodayCurriculum] 开始查找今日课程", {
        date: targetDate.toISO(),
    });

    const isTemp = (() => {
        if (!profile.enableConfig.tempSelected.enable) {
            Logger.trace("[findTodayCurriculum] 临时配置未启用");
            return false;
        }
        if (
            !profile.enableConfig.tempSelected.startTime ||
            !profile.enableConfig.tempSelected.endTime
        ) {
            Logger.warn("[findTodayCurriculum] 临时配置时间范围未设置");
            return false;
        }
        // 判断是否在时间范围内
        const inRange =
            profile.enableConfig.tempSelected.startTime.startOf("day") <=
            targetDate &&
            profile.enableConfig.tempSelected.endTime.startOf("day") >=
            targetDate;

        Logger.trace("[findTodayCurriculum] 临时配置时间范围检查", {
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
        Logger.debug("[findTodayCurriculum] 使用临时配置", {type, id});
    } else {
        type = profile.enableConfig.selected.type;
        id = profile.enableConfig.selected.id;
        Logger.debug("[findTodayCurriculum] 使用默认配置", {type, id});
    }

    // 根据ID查找
    if (type == "timegroup") {
        Logger.debug("[findTodayCurriculum] 处理时间组", {groupId: id});
        return handleTimeGroup(targetDate, profile.timeGroups[id]);
    } else {
        Logger.debug("[findTodayCurriculum] 返回课表", {curriculumId: id});
        return {
            curriculum: profile.curriculums[id],
            followTimeGroups: [],
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
