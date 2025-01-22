import { DateTime } from "luxon";

export interface Subject {
    name: string;
    shortName: string;
    notes: string;
    teacherName: string;
    attach?: {
        [key: string]: any;
    };
}

export interface Timetable {
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
    attach?: {
        [key: string]: any;
    };
}

interface LessonLayout extends BaseLayout {
    type: "lesson";
    subjectId: string;
}

interface BreakLayout extends BaseLayout {
    type: "break";
    breakName: string;
}

export type SubjectObject = {
    [key: string]: Subject;
};
export type TimetableObject = {
    [key: string]: Timetable;
};
