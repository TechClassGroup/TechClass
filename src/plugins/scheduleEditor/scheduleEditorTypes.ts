export interface Subject {
    name: string;
    shortName: string;
    notes: string;
    teacherName: string;
    isActive: boolean;
    attach?: {
        [key: string]: any;
    }
}

export type SubjectObject = {
    [key: string]: Subject;
};