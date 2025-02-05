/**
 * @fileOverview 今日课程配置
 */
import {ScheduleEditorProfileStore, todayConfig,} from "../scheduleEditorTypes";
import {DateTime} from "luxon";

function findTodayCurriculum(
    targetDate: DateTime,
    profile: ScheduleEditorProfileStore
) {
    const isTemp = () => {
        if (!profile.enableConfig.tempSelected.enable) {
            return false;
        }
        if (
            !profile.enableConfig.tempSelected.startTime ||
            !profile.enableConfig.tempSelected.endTime
        ) {
            return false;
        }

        if (
            profile.enableConfig.tempSelected.startTime.startOf("day") <=
            targetDate &&
            profile.enableConfig.tempSelected.endTime.startOf("day") >=
            targetDate
        ) {
            return true;
        }
        return false;
    };

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
