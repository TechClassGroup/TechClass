/**
 * @fileOverview 课表展示的循环
 */

import {computed, ref} from "vue";
import {scheduleEditorTodayConfig} from "../scheduleEditor/store/todayConfigStore";
import {DateTime} from "luxon";
import {todaySchedule} from "../scheduleEditor/scheduleEditorTypes";

const currentTime = ref<DateTime>(DateTime.now());
// temp
setInterval(() => {
    currentTime.value = DateTime.now();
}, 1000);

const sortedLessons = computed(() => {
    if (!scheduleEditorTodayConfig.value.schedule) {
        return [];
    }
    return Object.values(scheduleEditorTodayConfig.value.schedule).sort(
        (a, b) => {
            // 如果是分割线，放在最前面
            if (a.type === "dividingLine" && b.type !== "dividingLine")
                return -1;
            if (b.type === "dividingLine" && a.type !== "dividingLine")
                return 1;

            // 比较开始时间
            const startDiff = a.startTime.diff(b.startTime).toMillis();
            if (startDiff !== 0) return startDiff;

            // 如果开始时间相同，比较结束时间（只有非分割线的项目才有endTime）
            if (a.type !== "dividingLine" && b.type !== "dividingLine") {
                return a.endTime.diff(b.endTime).toMillis();
            }

            return 0;
        }
    );
});
const sortedLessonsWithoutDividingLine = computed(() => {
    return sortedLessons.value.filter(
        (lesson) => lesson.type !== "dividingLine"
    );
});

interface lessonStatus {
    currentLessons: todaySchedule[];
    futureLessons: todaySchedule[];
    status: "ok" | "beforeFirst" | "afterLast" | "noLesson";
}

const lessonStatus = computed<lessonStatus>(() => {
    const currentLessons: todaySchedule[] = [];
    const futureLessons: todaySchedule[] = [];
    const now = currentTime.value;

    // 如果没有课程，返回beforeFirst状态
    if (sortedLessonsWithoutDividingLine.value.length === 0) {
        return {
            currentLessons,
            futureLessons,
            status: "noLesson" as const,
        };
    }

    // 检查是否在第一节课之前
    const firstLesson = sortedLessonsWithoutDividingLine.value[0];
    if (now < firstLesson.startTime) {
        return {
            currentLessons,
            futureLessons: [
                firstLesson,
                ...sortedLessonsWithoutDividingLine.value.filter((lesson) =>
                    lesson.startTime.equals(firstLesson.startTime)
                ),
            ],
            status: "beforeFirst" as const,
        };
    }

    // 检查是否在最后一节课之后
    const lastLesson =
        sortedLessonsWithoutDividingLine.value[
        sortedLessonsWithoutDividingLine.value.length - 1
            ];
    if (now > lastLesson.endTime) {
        return {
            currentLessons,
            futureLessons,
            status: "afterLast" as const,
        };
    }

    // 找出当前正在进行的课程和下一节课
    let firstFutureTime: DateTime | null = null;

    sortedLessonsWithoutDividingLine.value.forEach((lesson) => {
        if (now >= lesson.startTime && now <= lesson.endTime) {
            currentLessons.push(lesson);
        } else if (now < lesson.startTime) {
            if (firstFutureTime === null) {
                firstFutureTime = lesson.startTime;
                futureLessons.push(lesson);
            } else if (lesson.startTime.equals(firstFutureTime)) {
                futureLessons.push(lesson);
            }
        }
    });

    return {
        currentLessons,
        futureLessons,
        status: "ok" as const,
    };
});

