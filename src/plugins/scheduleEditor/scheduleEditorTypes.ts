export interface Subject {
    name: string;
    shortName: string;
    notes: string;
    teacherName: string;
    attach?: {
        [key: string]: any;
    };
}

export type SubjectObject = {
    [key: string]: Subject;
};
