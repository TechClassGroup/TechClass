/**
 * @fileOverview 时间组处理器
 * 用于处理时间组的层级关系和课表查找
 */
import {DateTime} from "luxon";
import {Curriculum, ScheduleEditorProfileStore, TimeGroup, TimeGroupLayout,} from "../scheduleEditor.types";
import {scheduleEditorLogger} from "./utils";

export interface TimeGroupInfo {
    id: string;
    timeGroup: TimeGroup;
}

export interface CurriculumResult {
    curriculum: Curriculum | undefined;
    followTimeGroups: TimeGroupInfo[];
    isLoop: boolean;
}

class TimeGroupProcessor {
    /**
     * 是否是循环引用
     */
    public isLoop = false;
    private readonly granularityHandlers = {
        week: (date: DateTime) => date.weekday - 1,
        month: (date: DateTime) => date.day - 1,
    };

    constructor(
        private readonly profile: ScheduleEditorProfileStore,
        private readonly followTimeGroups: TimeGroupInfo[] = [],
        private startTime: DateTime | null = null
    ) {
    }

    process(
        targetDate: DateTime,
        timeGroup: TimeGroup,
        timeGroupId: string
    ): Curriculum | undefined {
        if (!timeGroup) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 未知时间组");
            return undefined;
        }

        if (this.followTimeGroups.some((info) => info.id === timeGroupId)) {
            scheduleEditorLogger.error("[TimeGroupProcessor] 检测到循环引用", {
                timeGroupId,
                followTimeGroups: this.followTimeGroups,
            });
            this.isLoop = true;
            this.followTimeGroups.push({
                id: timeGroupId,
                timeGroup: timeGroup,
            }); // 保证循环引用被记录
            return undefined;
        }

        this.followTimeGroups.push({
            id: timeGroupId,
            timeGroup: timeGroup,
        });

        scheduleEditorLogger.debug("[TimeGroupProcessor] 处理时间组", {
            granularity: timeGroup.granularity,
            dayCycleGranularity: timeGroup.dayCycleGranularity,
        });

        let target: TimeGroupLayout | undefined;

        if (
            timeGroup.granularity === "day" &&
            timeGroup.dayCycleGranularity !== "custom"
        ) {
            target = this.processDayCycleTimeGroup(targetDate, timeGroup);
        } else {
            target = this.processCustomTimeGroup(timeGroup, targetDate);
        }

        if (!target) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 未找到目标", {
                timeGroup,
            });
            return undefined;
        }

        if (target.type === "timegroup") {
            const nextTimeGroup = this.profile.timeGroups[target.id];
            return this.process(targetDate, nextTimeGroup, target.id);
        }
        return this.profile.curriculums[target.id];
    }

    private processCustomTimeGroup(
        timeGroup: TimeGroup,
        targetDate: DateTime
    ): TimeGroupLayout | undefined {
        // 判断是否继承时间
        // 如果是null -> 继承他的父组件的时间
        // 如果是DateTime -> 使用他作为开始时间，并且如果他有子timeGroup，那么他的子timeGroup也会继承这个时间
        if (timeGroup.startTime) {
            // 对齐到当天的开始时间 00:00:00
            this.startTime = timeGroup.startTime.startOf("day");
            scheduleEditorLogger.trace(
                "[TimeGroupProcessor] 非继承时间，已重新设置为",
                this.startTime
            );
        } else {
            scheduleEditorLogger.trace(
                "[TimeGroupProcessor] 继承时间，使用上次设置",
                this.startTime
            );
        }
        if (!this.startTime) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 未找到开始时间");
            return undefined;
        }
        if (targetDate < this.startTime) {
            // 目标日期在开始时间之前，还没办法生成
            scheduleEditorLogger.warn(
                "[TimeGroupProcessor] 目标日期在开始时间之前，无法生成"
            );
            return undefined;
        }

        let target: TimeGroupLayout | undefined;

        if (timeGroup.granularity === "year") {
            // 判断这是开始时间后的第几年
            // 比如开始时间是2024，targetDate是2024，那么year就是1
            // 2025 -> 2
            // 2026 -> 3
            const startTimeYearStart = this.startTime.startOf("year");
            const targetDateYearStart = targetDate.startOf("year");

            const diffYears = targetDateYearStart.diff(startTimeYearStart, [
                "years",
            ]).years;
            const totalYears = Math.floor(diffYears) + 1;

            const cycle = timeGroup.cycle;
            // 根据年份和周期判断layout index
            // 比如开始时间2024，周期3，那么可以知道:
            // 2024 -> 1 -> index 0
            // 2025 -> 2 -> index 1
            // 2026 -> 3 -> index 2
            // 2027 -> 1 -> index 0
            const index = (totalYears - 1) % cycle;
            scheduleEditorLogger.debug(
                `[TimeGroupProcessor] 年份: ${totalYears}`,
                `开始时间: ${startTimeYearStart.toISO()}, 目标时间: ${targetDateYearStart.toISO()}`,
                `周期: ${cycle}, index: ${index}`
            );
            target = timeGroup.layout[index];
        } else if (timeGroup.granularity === "month") {
            // 判断这是开始时间后的第几个月
            // 比如开始时间是2024-01-31，targetDate是2024-01-31，那么month就是1
            // 2024-02-01 -> 2
            // 2024-03-01 -> 3
            // 2024-04-01 -> 4
            const startTimeMonthStart = this.startTime.startOf("month");
            const targetDateMonthStart = targetDate.startOf("month");

            const diffMonths = targetDateMonthStart.diff(startTimeMonthStart, [
                "months",
            ]).months;
            const totalMonths = Math.floor(diffMonths) + 1;

            const cycle = timeGroup.cycle;
            // 根据月份和周期判断layout index
            // 比如开始时间2024-01-31，周期3，那么可以知道:
            // 2024-01-31 -> 1 -> index 0
            // 2024-02-01 -> 2 -> index 1
            // 2024-03-01 -> 3 -> index 2
            // 2024-04-01 -> 4 -> index 0
            const index = (totalMonths - 1) % cycle;
            scheduleEditorLogger.debug(
                `[TimeGroupProcessor] 月份: ${totalMonths}`,
                `开始时间: ${startTimeMonthStart.toISO()}, 目标时间: ${targetDateMonthStart.toISO()}`,
                `周期: ${cycle}, index: ${index}`
            );
            target = timeGroup.layout[index];
        } else if (timeGroup.granularity === "week") {
            // 将日期调整到当周的起始日（周一）
            const startTimeWeekStart = this.startTime.startOf("week");
            const targetDateWeekStart = targetDate.startOf("week");

            // 计算从开始时间到目标时间的完整周数
            // 使用 diff 计算天数差，然后除以7得到完整周数
            const diffDays = targetDateWeekStart.diff(startTimeWeekStart, [
                "days",
            ]).days;
            const totalWeeks = Math.floor(diffDays / 7) + 1;

            const cycle = timeGroup.cycle;
            const index = (totalWeeks - 1) % cycle;

            scheduleEditorLogger.debug(
                `[TimeGroupProcessor] 周数: ${totalWeeks}`,
                `开始周: ${startTimeWeekStart.toISO()}, 目标周: ${targetDateWeekStart.toISO()}`,
                `周期: ${cycle}, index: ${index}`
            );
            target = timeGroup.layout[index];
        } else if (timeGroup.granularity === "day") {
            // 判断这是开始时间后的第几天
            // 比如开始时间是2024-01-01，targetDate是2024-01-01，那么day就是1
            // 2024-01-02 -> 2
            // 2024-01-03 -> 3
            const diffDays = targetDate.diff(this.startTime, ["days"]).days;
            const totalDays = Math.floor(diffDays) + 1;
            const cycle = timeGroup.cycle;
            // 根据天数和周期判断layout index
            // 比如开始时间2024-01-01，周期3，那么可以知道:
            // 2024-01-01 -> 1 -> index 0
            // 2024-01-02 -> 2 -> index 1
            // 2024-01-03 -> 3 -> index 2
            // 2024-01-04 -> 4 -> index 0
            const index = (totalDays - 1) % cycle;
            scheduleEditorLogger.debug(
                `[TimeGroupProcessor] 天数: ${totalDays} targetDate: ${targetDate.day}`,
                `开始时间: ${this.startTime}, 周期: ${cycle}, index: ${index}`
            );
            target = timeGroup.layout[index];
        } else {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 未知的时间组粒度", {
                timeGroup,
            });
        }

        if (!target) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 找不到目标", {
                timeGroup,
                targetDate,
                startTime: this.startTime,
            });
        }
        scheduleEditorLogger.trace("[TimeGroupProcessor] 处理目标", target);
        return target;
    }

    private processDayCycleTimeGroup(
        targetDate: DateTime,
        timeGroup: TimeGroup
    ): TimeGroupLayout | undefined {
        const handler = this.granularityHandlers[timeGroup.dayCycleGranularity];
        if (!handler) {
            scheduleEditorLogger.warn(
                "[TimeGroupProcessor] 未知的时间组日期粒度",
                {timeGroup}
            );
            return undefined;
        }

        const index = handler(targetDate);
        const target = timeGroup.layout[index];

        if (!target) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 找不到目标", {
                timeGroup,
                index,
            });
            return undefined;
        }

        scheduleEditorLogger.trace("[TimeGroupProcessor] 处理目标", target);
        return target;
    }
}

/**
 * 处理时间组并返回结果
 * 对外暴露的主要接口，用于查找指定日期对应的课表
 * @param targetDate 目标日期
 * @param timeGroup 要处理的时间组
 * @param profile 课表编辑器配置
 * @param timeGroupId 时间组ID
 * @returns 包含课表和途径时间组的结果
 */
export function processTimeGroupWithResult(
    targetDate: DateTime,
    timeGroup: TimeGroup,
    profile: ScheduleEditorProfileStore,
    timeGroupId: string
): CurriculumResult {
    scheduleEditorLogger.debug("[processTimeGroupWithResult] 开始处理时间组", {
        date: targetDate,
        granularity: timeGroup.granularity,
        dayCycleGranularity: timeGroup.dayCycleGranularity,
    });

    const followTimeGroups: TimeGroupInfo[] = [];
    const processor = new TimeGroupProcessor(profile, followTimeGroups);
    const curriculum = processor.process(targetDate, timeGroup, timeGroupId);

    return {
        curriculum,
        followTimeGroups,
        isLoop: processor.isLoop,
    };
}
