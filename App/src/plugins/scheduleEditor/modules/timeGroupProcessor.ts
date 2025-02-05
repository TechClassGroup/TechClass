/**
 * @fileOverview 时间组处理器
 * 用于处理时间组的层级关系和课表查找
 */
import {DateTime} from "luxon";
import {Curriculum, ScheduleEditorProfileStore, TimeGroup,} from "../scheduleEditorTypes";
import {scheduleEditorLogger} from "./utils";

export interface TimeGroupTarget {
    type: "timegroup" | "curriculum";
    id: string;
}

export interface CurriculumResult {
    curriculum: Curriculum | undefined;
    followTimeGroups: TimeGroup[];
}

/**
 * 处理时间组目标
 * 根据目标类型，要么继续处理下一个时间组，要么返回最终的课表
 * @param target 时间组目标（可能是时间组或课表）
 * @param profile 课表编辑器配置
 * @param followTimeGroups 跟踪的时间组列表
 * @param targetDate 目标日期
 * @returns 找到的课表或undefined
 */
function handleTimeGroupTarget(
    target: TimeGroupTarget,
    profile: ScheduleEditorProfileStore,
    followTimeGroups: TimeGroup[],
    targetDate: DateTime
): Curriculum | undefined {
    scheduleEditorLogger.trace("[handleTimeGroupTarget] 处理目标", target);

    if (target.type === "timegroup") {
        const nextTimeGroup = profile.timeGroups[target.id];
        return processTimeGroup(
            targetDate,
            nextTimeGroup,
            profile,
            followTimeGroups
        );
    } else {
        return profile.curriculums[target.id];
    }
}

/**
 * 处理周粒度的时间组
 * 根据目标日期的星期几，从时间组布局中获取对应的目标
 * @param targetDate 目标日期
 * @param timeGroup 当前处理的时间组
 * @param profile 课表编辑器配置
 * @param followTimeGroups 跟踪的时间组列表
 * @returns 找到的课表或undefined
 */
function handleWeekGranularity(
    targetDate: DateTime,
    timeGroup: TimeGroup,
    profile: ScheduleEditorProfileStore,
    followTimeGroups: TimeGroup[]
): Curriculum | undefined {
    const weekDay = targetDate.weekday;
    const target = timeGroup.layout[weekDay - 1] as TimeGroupTarget;

    if (!target) {
        scheduleEditorLogger.warn("[handleWeekGranularity] 找不到目标", {
            timeGroup: timeGroup.layout,
            weekDay,
        });
        return undefined;
    }

    return handleTimeGroupTarget(target, profile, followTimeGroups, targetDate);
}

/**
 * 处理月粒度的时间组
 * 根据目标日期的日期，从时间组布局中获取对应的目标
 * @param targetDate 目标日期
 * @param timeGroup 当前处理的时间组
 * @param profile 课表编辑器配置
 * @param followTimeGroups 跟踪的时间组列表
 * @returns 找到的课表或undefined
 */
function handleMonthGranularity(
    targetDate: DateTime,
    timeGroup: TimeGroup,
    profile: ScheduleEditorProfileStore,
    followTimeGroups: TimeGroup[]
): Curriculum | undefined {
    const monthDay = targetDate.day;
    const target = timeGroup.layout[monthDay - 1] as TimeGroupTarget;

    if (!target) {
        scheduleEditorLogger.warn("[handleMonthGranularity] 找不到目标", {
            timeGroup: timeGroup.layout,
            monthDay,
        });
        return undefined;
    }

    return handleTimeGroupTarget(target, profile, followTimeGroups, targetDate);
}

/**
 * 处理时间组
 * 核心处理逻辑，根据时间组的粒度类型选择对应的处理方法
 * @param targetDate 目标日期
 * @param timeGroup 要处理的时间组
 * @param profile 课表编辑器配置
 * @param followTimeGroups 跟踪的时间组列表
 * @returns 找到的课表或undefined
 */
function processTimeGroup(
    targetDate: DateTime,
    timeGroup: TimeGroup,
    profile: ScheduleEditorProfileStore,
    followTimeGroups: TimeGroup[]
): Curriculum | undefined {
    if (!timeGroup) {
        scheduleEditorLogger.warn("[processTimeGroup] 未知时间组");
        return undefined;
    }

    followTimeGroups.push(timeGroup); // 添加到跟踪列表 给其他插件用

    scheduleEditorLogger.debug("[processTimeGroup] 处理时间组", {
        granularity: timeGroup.granularity,
        dayCycleGranularity: timeGroup.dayCycleGranularity,
    });

    if (timeGroup.dayCycleGranularity === "custom") {
        return undefined; // 暂时返回undefined，后续实现自定义逻辑
    }

    const granularityHandlers = {
        week: () =>
            handleWeekGranularity(
                targetDate,
                timeGroup,
                profile,
                followTimeGroups
            ),
        month: () =>
            handleMonthGranularity(
                targetDate,
                timeGroup,
                profile,
                followTimeGroups
            ),
    };

    const handler = granularityHandlers[timeGroup.dayCycleGranularity];
    if (!handler) {
        scheduleEditorLogger.warn("[processTimeGroup] 未知的时间组日期粒度", {
            timeGroup: timeGroup,
        });
        return undefined;
    }

    return handler();
}

/**
 * 处理时间组并返回结果
 * 对外暴露的主要接口，用于查找指定日期对应的课表
 * @param targetDate 目标日期
 * @param timeGroup 要处理的时间组
 * @param profile 课表编辑器配置
 * @returns 包含课表和途径时间组的结果
 */
export function processTimeGroupWithResult(
    targetDate: DateTime,
    timeGroup: TimeGroup,
    profile: ScheduleEditorProfileStore
): CurriculumResult {
    scheduleEditorLogger.debug("[processTimeGroupWithResult] 开始处理时间组", {
        date: targetDate,
        granularity: timeGroup.granularity,
        dayCycleGranularity: timeGroup.dayCycleGranularity,
    });

    const followTimeGroups: TimeGroup[] = [];
    const curriculum = processTimeGroup(
        targetDate,
        timeGroup,
        profile,
        followTimeGroups
    );

    return {
        curriculum,
        followTimeGroups,
    };
}
