/**
 * @fileOverview 时间组处理器
 * 用于处理时间组的层级关系和课表查找
 */
import {DateTime} from "luxon";
import {Curriculum, ScheduleEditorProfileStore, TimeGroup, TimeGroupLayout,} from "../scheduleEditorTypes";
import {scheduleEditorLogger} from "./utils";


export interface CurriculumResult {
    curriculum: Curriculum | undefined;
    followTimeGroups: TimeGroup[];
}

class TimeGroupProcessor {
    private readonly granularityHandlers = {
        week: (date: DateTime) => date.weekday - 1,
        month: (date: DateTime) => date.day - 1,
    };

    constructor(
        private readonly profile: ScheduleEditorProfileStore,
        private readonly followTimeGroups: TimeGroup[] = [],
        private startTime: DateTime | null = null
    ) {
    }

    process(
        targetDate: DateTime,
        timeGroup: TimeGroup
    ): Curriculum | undefined {
        if (!timeGroup) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 未知时间组");
            return undefined;
        }

        this.followTimeGroups.push(timeGroup);

        scheduleEditorLogger.debug("[TimeGroupProcessor] 处理时间组", {
            granularity: timeGroup.granularity,
            dayCycleGranularity: timeGroup.dayCycleGranularity,
        });

        let target: TimeGroupLayout | undefined;

        if (
            timeGroup.granularity === "day" && timeGroup.dayCycleGranularity !== "custom"
        ) {
            target = this.processDayCycleTimeGroup(targetDate, timeGroup);

        } else {
            target = this.processCustomTimeGroup(timeGroup);
        }

        if (!target) {
            scheduleEditorLogger.warn("[TimeGroupProcessor] 未找到目标", {timeGroup});
            return undefined;
        }

        if (target.type === "timegroup") {
            const nextTimeGroup = this.profile.timeGroups[target.id];
            return this.process(targetDate, nextTimeGroup);
        }
        return this.profile.curriculums[target.id];
    }

    private processCustomTimeGroup(
        timeGroup: TimeGroup
    ): TimeGroupLayout | undefined {
        if (timeGroup.startTime && this.startTime === null) {
            this.startTime = timeGroup.startTime; // 记录开始时间 实现顶层覆盖底层
        }
        return undefined; // 暂时返回undefined，后续实现自定义逻辑
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
    const processor = new TimeGroupProcessor(profile, followTimeGroups);
    const curriculum = processor.process(targetDate, timeGroup);

    return {
        curriculum,
        followTimeGroups,
    };
}
