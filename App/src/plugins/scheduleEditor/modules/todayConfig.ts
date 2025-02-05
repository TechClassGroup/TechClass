/**
 * @fileOverview 今日课程配置
 */
import {Curriculum, ScheduleEditorProfileStore, TimeGroup, todayConfig,} from "../scheduleEditorTypes";
import {DateTime} from "luxon";
import Logger from "../../../modules/logger";

class logger {

    static trace(...args: any[]) {
        Logger.trace("[scheduleEditor]", ...args);
    }

    static debug(...args: any[]) {
        Logger.debug("[scheduleEditor]", ...args);
    }

    static info(...args: any[]) {
        Logger.info("[scheduleEditor]", ...args);
    }

    static warn(...args: any[]) {
        Logger.warn("[scheduleEditor]", ...args);
    }

    static error(...args: any[]) {
        Logger.error("[scheduleEditor]", ...args);
    }
}

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
    timeGroup: TimeGroup,
    profile: ScheduleEditorProfileStore
): curriculumResult {
    let startTime: DateTime | null = null;
    const followTimeGroups: TimeGroup[] = [];
    let curriculum: Curriculum | undefined = undefined;

    function _find(currentTimeGroup: TimeGroup) {

        if (!currentTimeGroup) {
            logger.warn("[findTodayCurriculum] 未知时间组");
            return;
        }
        followTimeGroups.push(currentTimeGroup);
        if (
            currentTimeGroup.granularity == "day" &&
            currentTimeGroup.dayCycleGranularity != "custom"
        ) {
            // 根据粒度查找
            if (currentTimeGroup.dayCycleGranularity == "week") {
                // 星期几？
                const weekDay = targetDate.weekday;
                const target = currentTimeGroup.layout[weekDay - 1];
                if (!target) {
                    logger.warn("[findTodayCurriculum] 找不到目标", {
                        timeGroup: currentTimeGroup.layout,
                        weekDay,
                    })
                    return;
                }
                if (target.type == "timegroup") {
                    _find(profile.timeGroups[target.id]);
                } else {
                    curriculum = profile.curriculums[target.id];
                }
            } else if (currentTimeGroup.dayCycleGranularity == "month") {
                // 第几号？
                const monthDay = targetDate.day;
                const target = currentTimeGroup.layout[monthDay - 1];
                if (!target) {
                    logger.warn("[findTodayCurriculum] 找不到目标", {
                        timeGroup: currentTimeGroup.layout,
                        monthDay,
                    });
                    return;
                }
                if (target.type == "timegroup") {
                    _find(profile.timeGroups[target.id]);
                } else {
                    curriculum = profile.curriculums[target.id];
                }
            } else {
                logger.warn("[findTodayCurriculum] 未知的时间组日期粒度", {
                    timeGroup: currentTimeGroup,
                });
            }
        } else {
            if (!startTime) {
                startTime = currentTimeGroup.startTime;
            }
            // 自定义时间段
        }
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
    logger.debug("[findTodayCurriculum] 开始查找今日课程", {
        date: targetDate.toISO(),
    });

    const isTemp = (() => {
        if (!profile.enableConfig.tempSelected.enable) {
            logger.trace("[findTodayCurriculum] 临时配置未启用");
            return false;
        }
        if (
            !profile.enableConfig.tempSelected.startTime ||
            !profile.enableConfig.tempSelected.endTime
        ) {
            logger.warn("[findTodayCurriculum] 临时配置时间范围未设置");
            return false;
        }
        // 判断是否在时间范围内
        const inRange =
            profile.enableConfig.tempSelected.startTime.startOf("day") <=
            targetDate &&
            profile.enableConfig.tempSelected.endTime.startOf("day") >=
            targetDate;

        logger.trace("[findTodayCurriculum] 临时配置时间范围检查", {
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
        logger.debug("[scheduleEditor] 使用临时配置", {type, id});
    } else {
        type = profile.enableConfig.selected.type;
        id = profile.enableConfig.selected.id;
        logger.debug("[scheduleEditor]  使用默认配置", {type, id});
    }

    // 根据ID查找
    if (type == "timegroup") {
        logger.debug("[findTodayCurriculum] 处理时间组", {groupId: id});
        return handleTimeGroup(targetDate, profile.timeGroups[id], profile);
    } else {
        logger.debug("[findTodayCurriculum] 返回课表", {curriculumId: id});
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
