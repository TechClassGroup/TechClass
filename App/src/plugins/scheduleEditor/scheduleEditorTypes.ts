/**
 * @fileOverview 课程表编辑器的类型定义
 */
import {DateTime} from "luxon";
import {scheduleEditorProfile} from "./store/scheduleEditorProfile";
import {scheduleEditorTodayConfig} from "./store/todayConfigStore";

/**
 * 课程信息接口
 */
interface Subject {
    /** 课程名称 */
    name: string;
    /** 课程简称 */
    shortName: string;
    /**
     * 课程备注
     * 因为课程的名称无法表达所有信息，所以可以通过备注来补充，其他的名称就没什么关系了，用不着
     */
    notes: string;
    /** 教师姓名 */
    teacherName: string;
    /** 附加信息 */
    attach?: {
        [key: string]: any;
    };
}

/**
 * 时间表布局类型
 */
type timetableLayouts = LessonLayout | BreakLayout | dividingLineLayout;
/**
 * 时间表布局类型的type
 */
type timetableLayoutTypes = timetableLayouts["type"];

/**
 * 时间表接口
 */
interface Timetable {
    /** 时间表名称 */
    name: string;
    /** 时间表布局，key为布局ID */
    layouts: {
        [key: string]: timetableLayouts;
    };
    /** 附加信息 */
    attach?: {
        [key: string]: any;
    };
}

/**
 * 基础布局接口
 */
interface BaseLayout {
    /** 开始时间 */
    startTime: DateTime;

    /** 附加信息 */
    attach?: {
        [key: string]: any;
    };
}

/**
 * 课程布局接口，继承自基础布局
 */
interface LessonLayout extends BaseLayout {
    /** 布局类型 */
    type: "lesson";
    /** 默认课程的ID */
    subjectId: string;
    /** 结束时间 */
    endTime: DateTime;
    /**
     * 是否单独显示
     * 为true时，只有时间适合时，才会显示在一个独立的位置，而不是和课程一起显示
     */
    noDisplayedSeparately: boolean;
}

/**
 * 休息时间布局接口，继承自基础布局
 */
interface BreakLayout extends BaseLayout {
    /** 布局类型 */
    type: "break";
    /** 课间休息的名称 */
    breakName: string;
    breakShortName: string;
    /** 结束时间 */
    endTime: DateTime;
    /**
     * 是否单独显示
     * 为true时，只有时间适合时，才会显示在一个独立的位置，而不是和课程一起显示
     */
    noDisplayedSeparately: boolean;
}

/**
 * 分割线布局接口，继承自基础布局
 * 他不关心结束时间，只关心开始时间
 */
interface dividingLineLayout extends BaseLayout {
    type: "dividingLine";
}

type ClassType = {
    /** 时间ID */
    timeId: string;
    /** 课程ID */
    subjectId: string;
    /** 附加信息 */
    attach?: {
        [key: string]: any;
    };
};

/**
 * 课程表接口
 */
export interface Curriculum {
    /** 课程表名称 */
    name: string;
    /** 关联的时间表ID */
    timetableId: string;

    /**
     * 课程安排列表
     * 对课程表规定的时间的具体实现
     */
    classes: ClassType[];
    /** 附加信息 */
    attach?: {
        [key: string]: any;
    };
}

export interface TimeGroupLayout {
    /**
     * layout的类型 可以选择是另一个timeGroup或者是一个课表
     */
    type: "curriculum" | "timegroup";
    id: string;
    attach?: {
        [key: string]: any;
    };
}

export interface TimeGroup {
    /**
     * 时间组的名称
     */
    name: string;
    /**
     * 时间组的粒度
     */
    granularity: "day" | "week" | "month" | "year";
    /**
     * 天的预设周期  必须在粒度为day的时候才有意义
     * 当为week的时候，就需要分配周一——周日
     * 当为month的时候，就需要分配1-31
     * 当为year的时候，就需要分配1-366
     * 当为custom的时候，就直接读取Cycle (其他时候cycle隐藏)
     */
    dayCycleGranularity: "week" | "month" | "custom";
    /**
     * 自定义时间组的周期 如果dayCycleGranularity为custom，那么这个值就是自定义的周期
     */
    cycle: number;
    /**
     * 开始时间
     * 为null时，表示继承父级时间组的开始时间
     * 为DateTime时，表示具体的开始时间
     */
    startTime: DateTime | null;
    /**
     * 对周期中每个时间段的分布
     * example:
     * cycle = 2
     * 那么layout的长度应该为2，每个元素对应一个时间段
     */
    layout: TimeGroupLayout[];
    attach?: {
        [key: string]: any;
    };
}

/**
 * 课程对象类型，key为课程ID
 */
export type SubjectObject = {
    [key: string]: Subject;
};

/**
 * 时间表对象类型，key为时间表ID
 */
export type TimetableObject = {
    [key: string]: Timetable;
};

/**
 * 课程表对象类型，key为课程表ID
 */
export type CurriculumObject = {
    [key: string]: Curriculum;
};
/**
 * 时间组对象类型，key为时间组ID
 */
export type timeGroupObject = {
    [key: string]: TimeGroup;
};
/**
 * 启用设置
 */
/**
 * 启用配置类型
 */
export type enableConfig = {
    /**
     * 当前启用的对象
     */
    selected: {
        /**
         * 启用对象的类型
         */
        type: "curriculum" | "timegroup";
        /**
         * 启用对象的ID
         */
        id: string;
    };
    /**
     * 临时覆盖的对象 允许有持续时间 (endTime之前)
     */
    tempSelected: {
        /**
         * 是否启用临时覆盖
         */
        enable: boolean;
        /**
         * 临时覆盖对象的类型
         */
        type: "curriculum" | "timegroup";
        /**
         * 临时覆盖对象的ID
         */
        id: string;
        /**
         * 临时覆盖的开始时间
         */
        startTime: DateTime;
        /**
         * 临时覆盖的结束时间
         */
        endTime: DateTime;
    };
};

/**
 * 课程表编辑器配置存储类型
 */
export type ScheduleEditorProfileStore = {
    /**
     * 课程对象
     */
    subjects: SubjectObject;
    /**
     * 时间表对象
     */
    timetables: TimetableObject;
    /**
     * 课程表对象
     */
    curriculums: CurriculumObject;
    /**
     * 时间组对象
     */
    timeGroups: timeGroupObject;
    /**
     * 启用配置
     */
    enableConfig: enableConfig;
};
type todayScheduleBase = {

    startTime: DateTime;

    attach?: {
        [key: string]: any;
    }
}

export interface todayScheduleLesson extends todayScheduleBase {
    type: "lesson";
    name: string;
    shortName: string;
    teacherName: string;
    endTime: DateTime;
    noDisplayedSeparately: boolean;
}

export interface todayScheduleBreak extends todayScheduleBase {
    type: "break";
    shortName: string;
    name: string;
    endTime: DateTime;
    noDisplayedSeparately: boolean;
}

export interface todayScheduleDividingLine extends todayScheduleBase {
    type: "dividingLine";
}

/**
 * 今日课程类型
 */
export type todaySchedule = todayScheduleLesson | todayScheduleBreak | todayScheduleDividingLine;

/**
 * 今日配置类型
 */
export interface todayConfig {
    /**
     * 生成日期
     */
    generateDate: DateTime;
    /**
     * 课程表，key为课程ID
     */
    schedule: {
        [key: string]: todaySchedule;
    };
    /**
     * 附加数据
     */
    attach?: {
        [key: string]: any;
    };
}

export interface scheduleEditorApi {
    profile: typeof scheduleEditorProfile;
    todayConfig: typeof scheduleEditorTodayConfig;
}