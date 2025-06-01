/**
 * @fileOverview 课表展示的循环
 */

import {computed, ref} from "vue";
import {scheduleEditorTodayConfig} from "../scheduleEditor/store/todayConfigStore";
// todo 这边可以解耦一下，scheduleEditorTodayConfig改成从API调用
import {DateTime} from "luxon";
import {
    type LessonList,
    LessonListEnum,
    type LessonListWithoutDividingLine,
    LessonStatusEnum,
    type lessonStatusType,
    type ScheduleWithId,
    type ScheduleWithIdWithoutDividingLine
} from "./scheduleDisplay.types";

const currentTime = ref<DateTime>(DateTime.now());
// temp
setInterval(() => {
    currentTime.value = DateTime.now();
}, 1000);

const sortedLessons = computed<ScheduleWithId[]>(() => {
    if (!scheduleEditorTodayConfig.value.schedule) {
        return [];
    }

    const lessonsWithId: ScheduleWithId[] = Object.entries(
        scheduleEditorTodayConfig.value.schedule
    ).map(([id, lesson]) => ({
        id,
        lesson,
    }));

    return lessonsWithId.sort((a, b) => {
        // 首先比较开始时间 - 所有类型都应该按开始时间排序
        const startDiff = a.lesson.startTime.diff(b.lesson.startTime).toMillis();

        if (startDiff !== 0) return startDiff;

        // 开始时间相同时，分割线优先
        if (a.lesson.type === "dividingLine") return -1;
        if (b.lesson.type === "dividingLine") return 1;

        // 最后比较结束时间
        return a.lesson.endTime.diff(b.lesson.endTime).toMillis();
    });
});

const sortedLessonsWithoutDividingLine = computed<
    ScheduleWithIdWithoutDividingLine[]
>(() => {
    return sortedLessons.value.filter(
        (lesson) => lesson.lesson.type !== "dividingLine"
    ) as ScheduleWithIdWithoutDividingLine[];
});

export const lessonStatus = computed<lessonStatusType>(() => {
    const currentLessons: ScheduleWithIdWithoutDividingLine[] = [];
    const futureLessons: ScheduleWithIdWithoutDividingLine[] = [];
    const now = currentTime.value;

    // 如果没有课程，返回beforeFirst状态
    if (sortedLessonsWithoutDividingLine.value.length === 0) {
        return {
            currentLessons,
            futureLessons,
            status: LessonStatusEnum.noLesson
        };
    }

    // 检查是否在第一节课之前
    const firstLesson = sortedLessonsWithoutDividingLine.value[0];
    if (now < firstLesson.lesson.startTime) {
        // 找到所有与第一节课开始时间相同的课程
        return {
            currentLessons,
            futureLessons: sortedLessonsWithoutDividingLine.value.filter(
                (lesson) => {
                    lesson.lesson.startTime.equals(
                        firstLesson.lesson.startTime
                    );
                }
            ),
            status: LessonStatusEnum.beforeFirst
        };
    }

    // 检查是否在最后一节课之后
    const lastLesson =
        sortedLessonsWithoutDividingLine.value[
        sortedLessonsWithoutDividingLine.value.length - 1
            ];
    if (now > lastLesson.lesson.endTime) {
        return {
            currentLessons,
            futureLessons,
            status: LessonStatusEnum.afterLast
        };
    }

    // 找出当前正在进行的课程和下一节课
    let firstFutureTime: DateTime | null = null;

    for (const val of sortedLessonsWithoutDividingLine.value) {
        const lesson = val.lesson;
        // current
        if (now >= lesson.startTime && now <= lesson.endTime) {
            currentLessons.push(val);
            continue;
        }
        // future
        if (now < lesson.startTime) {
            if (firstFutureTime === null) {
                firstFutureTime = lesson.startTime;
            }
            if (lesson.startTime.equals(firstFutureTime)) {
                futureLessons.push(val);
            }
        }
    }

    return {
        currentLessons,
        futureLessons,
        status: LessonStatusEnum.ok,
    };
});

export const lessonList = computed<LessonList>(() => {
    const list: LessonList = [];
    const currentLessons = lessonStatus.value.currentLessons;
    const futureLessons = lessonStatus.value.futureLessons;
    for (const val of sortedLessons.value) {
        const lesson = val.lesson;
        const id = val.id;
        if (lesson.type === "dividingLine") {
            list.push({id, lesson, status: LessonListEnum.normal});
            continue;
        }
        if (currentLessons.find((val) => val.id === id)) {
            list.push({id, lesson, status: LessonListEnum.current});
            continue;
        }
        if (futureLessons.find((val) => val.id === id)) {
            list.push({id, lesson, status: LessonListEnum.future});
            continue;
        }
        list.push({id, lesson, status: LessonListEnum.normal});
    }
    return list;
});

export const normalLessonList = computed<LessonList>(() => {
    return lessonList.value.filter((val) => {
        if (val.lesson.type === "dividingLine") {
            return true;
        }
        return val.lesson.noDisplayedSeparately === false;
    });
})

export const noDisplayedSeparatelyLessonList = computed<LessonListWithoutDividingLine>(() => {
    return lessonList.value.filter((val) => {
        if (val.lesson.type === "dividingLine") {
            return false;
        }
        return val.lesson.noDisplayedSeparately === true;

    }) as LessonListWithoutDividingLine;
})