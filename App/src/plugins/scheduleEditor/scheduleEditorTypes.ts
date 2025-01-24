import { DateTime } from "luxon";

interface Subject {
    name: string;
    shortName: string;
    notes: string;
    teacherName: string;
    attach?: {
        [key: string]: any;
    };
}

interface Timetable {
    name: string;
    layouts: {
        [key: string]: LessonLayout | BreakLayout;
    };
    attach?: {
        [key: string]: any;
    };
}

interface BaseLayout {
    startTime: DateTime;
    endTime: DateTime;
    /**
     * 是否单独显示 (为true时，只有时间适合时，才会显示在一个独立的位置，而不是和课程一起显示)
     */
    hide: boolean;
    attach?: {
        [key: string]: any;
    };
}

interface LessonLayout extends BaseLayout {
    type: "lesson";
    /**
     * 默认课程的ID
     */
    subjectId: string;
}

interface BreakLayout extends BaseLayout {
    type: "break";
    /**
     * 课间休息的名称
     */
    breakName: string;
}

export type SubjectObject = {
    [key: string]: Subject;
};
export type TimetableObject = {
    [key: string]: Timetable;
};
