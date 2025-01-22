import { IPlugin } from "@/types/plugins";
import scheduleEditorSetting from "@/plugins/scheduleEditor/scheduleEditorComponents/scheduleEditorSetting.vue";
import {
    SubjectObject,
    TimetableObject,
} from "@/plugins/scheduleEditor/scheduleEditorTypes.ts";
import { ref } from "vue";
import { DateTime } from "luxon";

const createScheduleEditorStore = () => {
    // 测试数据
    return {
        subjects: {
            "550e8400-e29b-41d4-a716-446655440000": {
                name: "数学",
                shortName: "数",
                notes: "数学喵",
                teacherName: "",
            },
            "7a8b9c10-d11e-12f1-3g45-678901234567": {
                name: "语文",
                shortName: "语",
                notes: "语文课",
                teacherName: "王老师",
            },
            "2c3d4e5f-6g7h-8i9j-0k1l-234567890abc": {
                name: "英语",
                shortName: "英",
                notes: "英语课程",
                teacherName: "李老师",
            },
            "9d8c7b6a-5e4f-3g2h-1i0j-klmnopqrstuv": {
                name: "物理",
                shortName: "物",
                notes: "物理实验课",
                teacherName: "张老师",
            },
            "3f4g5h6i-7j8k-9l0m-1n2o-pqrstuvwxyz1": {
                name: "化学",
                shortName: "化",
                notes: "化学实验课",
                teacherName: "陈老师",
            },
        } as SubjectObject,
        timetables: {
            "550e8400-e29b-41d4-a716-446655440001": {
                name: "标准课表",
                layouts: {
                    "550e8400-e29b-41d4-a716-446655440002": {
                        type: "lesson",
                        startTime: DateTime.fromObject({ hour: 8, minute: 0 }),
                        endTime: DateTime.fromObject({ hour: 8, minute: 45 }),
                        subjectId: "550e8400-e29b-41d4-a716-446655440000",
                    },
                    "550e8400-e29b-41d4-a716-446655440003": {
                        type: "break",
                        startTime: DateTime.fromObject({ hour: 8, minute: 45 }),
                        endTime: DateTime.fromObject({ hour: 9, minute: 0 }),
                        breakName: "课间休息",
                    },
                },
            },
            "7a8b9c10-d11e-12f1-3g45-678901234568": {
                name: "双课连排",
                layouts: {
                    "7a8b9c10-d11e-12f1-3g45-678901234569": {
                        type: "lesson",
                        startTime: DateTime.fromObject({
                            hour: 14,
                            minute: 30,
                        }),
                        endTime: DateTime.fromObject({ hour: 16, minute: 0 }),
                        subjectId: "7a8b9c10-d11e-12f1-3g45-678901234567",
                    },
                    "7a8b9c10-d11e-12f1-3g45-678901234570": {
                        type: "break",
                        startTime: DateTime.fromObject({ hour: 16, minute: 0 }),
                        endTime: DateTime.fromObject({ hour: 16, minute: 20 }),
                        breakName: "大课间",
                    },
                },
            },
            "9d8c7b6a-5e4f-3g2h-1i0j-klmnopqrstuv": {
                name: "实验课程",
                layouts: {
                    "9d8c7b6a-5e4f-3g2h-1i0j-klmnopqrstu1": {
                        type: "lesson",
                        startTime: DateTime.fromObject({ hour: 10, minute: 0 }),
                        endTime: DateTime.fromObject({ hour: 11, minute: 30 }),
                        subjectId: "9d8c7b6a-5e4f-3g2h-1i0j-klmnopqrstuv",
                    },
                },
            },
            "2c3d4e5f-6g7h-8i9j-0k1l-234567890abd": {
                name: "早自习",
                layouts: {
                    "2c3d4e5f-6g7h-8i9j-0k1l-234567890abe": {
                        type: "lesson",
                        startTime: DateTime.fromObject({ hour: 7, minute: 30 }),
                        endTime: DateTime.fromObject({ hour: 8, minute: 0 }),
                        subjectId: "2c3d4e5f-6g7h-8i9j-0k1l-234567890abc",
                    },
                    "2c3d4e5f-6g7h-8i9j-0k1l-234567890abf": {
                        type: "break",
                        startTime: DateTime.fromObject({ hour: 8, minute: 0 }),
                        endTime: DateTime.fromObject({ hour: 8, minute: 30 }),
                        breakName: "早餐时间",
                    },
                },
            },
            "3f4g5h6i-7j8k-9l0m-1n2o-pqrstuvwxyz2": {
                name: "晚自习",
                layouts: {
                    "3f4g5h6i-7j8k-9l0m-1n2o-pqrstuvwxyz3": {
                        type: "lesson",
                        startTime: DateTime.fromObject({
                            hour: 18,
                            minute: 30,
                        }),
                        endTime: DateTime.fromObject({ hour: 19, minute: 15 }),
                        subjectId: "3f4g5h6i-7j8k-9l0m-1n2o-pqrstuvwxyz1",
                    },
                    "3f4g5h6i-7j8k-9l0m-1n2o-pqrstuvwxyz4": {
                        type: "break",
                        startTime: DateTime.fromObject({
                            hour: 19,
                            minute: 15,
                        }),
                        endTime: DateTime.fromObject({ hour: 19, minute: 30 }),
                        breakName: "课间休息",
                    },
                },
            },
        } as TimetableObject,
    };
};

type ScheduleEditorStore = ReturnType<typeof createScheduleEditorStore>;
// 创建响应式状态
export const scheduleEditorState = ref<ScheduleEditorStore>(
    {} as ScheduleEditorStore
);

/**
 * @fileOverview 课表编辑器插件
 */
export const scheduleEditor: IPlugin = {
    name: "课表编辑器",
    description: "",
    id: "scheduleEditor",
    isOfficial: true,
    component: {
        mainPage: null,
        settingPage: scheduleEditorSetting,
    },
    hooks: {
        onMounted: () => {
            scheduleEditorState.value = createScheduleEditorStore();
        },
        onUnmounted: () => {
            scheduleEditorState.value = {} as ScheduleEditorStore;
        },
    },
};
