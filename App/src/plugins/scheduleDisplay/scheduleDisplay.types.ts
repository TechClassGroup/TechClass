/**
 * @fileOverview scheduleDisplay的类型定义
 */
import {todaySchedule} from "../scheduleEditor/scheduleEditor.types";

/**
 * 排除分割线类型的课程表类型
 */
type ScheduleWithoutDividingLine = Exclude<
    todaySchedule,
    { type: "dividingLine" }
>;

/**
 * 带有唯一标识符的课程表项
 * @interface ScheduleWithId
 * @property {string} id - 课程表项的唯一标识符
 * @property {todaySchedule} lesson - 课程表项的内容
 */
export interface ScheduleWithId {
    id: string;
    lesson: todaySchedule;
}

/**
 * 带有唯一标识符的非分割线课程表项
 * @interface ScheduleWithIdWithoutDividingLine
 * @property {string} id - 课程表项的唯一标识符
 * @property {ScheduleWithoutDividingLine} lesson - 非分割线课程表项的内容
 */
export interface ScheduleWithIdWithoutDividingLine {
    id: string;
    lesson: ScheduleWithoutDividingLine;
}

/**
 * 课程状态枚举
 * @enum {number}
 */
export enum LessonStatusEnum {
    /** 正常状态 */
    ok,
    /** 在第一节课之前 */
    beforeFirst,
    /** 在最后一节课之后 */
    afterLast,
    /** 没有课程 */
    noLesson,
}

/**
 * 课程状态接口
 * @interface lessonStatusType
 * @property {ScheduleWithIdWithoutDividingLine[]} currentLessons - 当前正在进行的课程列表
 * @property {ScheduleWithIdWithoutDividingLine[]} futureLessons - 未来将要进行的课程列表
 * @property {LessonStatusEnum} status - 课程状态
 */
export interface lessonStatusType {
    currentLessons: ScheduleWithIdWithoutDividingLine[];
    futureLessons: ScheduleWithIdWithoutDividingLine[];
    status: LessonStatusEnum;
}

/**
 * 课程列表类型枚举
 * @enum {number}
 */
export enum LessonListEnum {
    /** 当前课程 */
    current,
    /** 未来课程 */
    future,
    /** 普通课程 */
    normal,
}

/**
 * 课程列表类型
 * @typedef {Object[]} LessonList
 * @property {string} id - 课程的唯一标识符
 * @property {todaySchedule} lesson - 课程内容
 * @property {LessonListEnum} status - 课程状态
 */
export type LessonList = {
    id: string;
    lesson: todaySchedule;
    status: LessonListEnum;
}[];
