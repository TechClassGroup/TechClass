import {ref} from "vue";
import {DateTime} from "luxon";
import {ScheduleEditorStore} from "./scheduleEditorTypes";
import {PluginStore} from "../../types/plugins";

function createScheduleEditorStore(): ScheduleEditorStore {
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
        },
        timetables: {
            "550e8400-e29b-41d4-a716-446655440001": {
                name: "标准课表",
                layouts: {
                    "550e8400-e29b-41d4-a716-446655440002": {
                        type: "lesson",
                        startTime: DateTime.fromObject({hour: 8, minute: 0}),
                        endTime: DateTime.fromObject({hour: 8, minute: 45}),
                        subjectId: "550e8400-e29b-41d4-a716-446655440000",
                        hide: false,
                    },
                    "550e8400-e29b-41d4-a716-446655440003": {
                        type: "break",
                        startTime: DateTime.fromObject({hour: 8, minute: 45}),
                        endTime: DateTime.fromObject({hour: 9, minute: 0}),
                        breakName: "课间休息",
                        hide: true,
                    },
                },
            },
            "b1234567-e29b-41d4-a716-446655440abc": {
                name: "下午课表",
                layouts: {
                    "c1234567-e29b-41d4-a716-446655440def": {
                        type: "lesson",
                        startTime: DateTime.fromObject({
                            hour: 14,
                            minute: 30,
                        }),
                        endTime: DateTime.fromObject({hour: 15, minute: 15}),
                        subjectId: "550e8400-e29b-41d4-a716-446655440000",
                        hide: false,
                    },
                    "d1234567-e29b-41d4-a716-446655440ghi": {
                        type: "break",
                        startTime: DateTime.fromObject({
                            hour: 15,
                            minute: 15,
                        }),
                        endTime: DateTime.fromObject({hour: 15, minute: 30}),
                        breakName: "下午休息",
                        hide: true,
                    },
                },
            },
        },
        curriculums: {
            "e1234567-e29b-41d4-a716-446655440jkl": {
                name: "周一课表",
                timetableId: "550e8400-e29b-41d4-a716-446655440001",
                classes: [
                    {
                        timeId: "550e8400-e29b-41d4-a716-446655440002",
                        subjectId: "7a8b9c10-d11e-12f1-3g45-678901234567",
                    },
                ],
            },
            "f1234567-e29b-41d4-a716-446655440mno": {
                name: "周二课表",
                timetableId: "b1234567-e29b-41d4-a716-446655440abc",
                classes: [
                    {
                        timeId: "c1234567-e29b-41d4-a716-446655440def",
                        subjectId: "2c3d4e5f-6g7h-8i9j-0k1l-234567890abc",
                    },
                ],
            },
            "g1234567-e29b-41d4-a716-446655440pqr": {
                name: "周三课表",
                timetableId: "550e8400-e29b-41d4-a716-446655440001",
                classes: [
                    {
                        timeId: "550e8400-e29b-41d4-a716-446655440002",
                        subjectId: "9d8c7b6a-5e4f-3g2h-1i0j-klmnopqrstuv",
                    },
                ],
            },
        },
        timeGroups: {
            "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6": {
                name: "春季学期第一周",
                granularity: "week",
                cycle: 2,
                startTime: DateTime.fromISO("2024-03-01T00:00:00"),
                layout: [
                    {
                        type: "timegroup",
                        id: "b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7",
                    },
                    {
                        type: "timegroup",
                        id: "c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8",
                    },
                ],
            },
            "b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7": {
                name: "标准教学日",
                granularity: "day",
                cycle: 1,
                startTime: null,
                layout: [
                    {
                        type: "curriculum",
                        id: "e1234567-e29b-41d4-a716-446655440jkl",
                    },
                ],
            },
            "c3d4e5f6-g7h8-49i0-j1k2-l3m4n5o6p7q8": {
                name: "特殊教学日",
                granularity: "day",
                cycle: 1,
                startTime: null,
                layout: [
                    {
                        type: "curriculum",
                        id: "f1234567-e29b-41d4-a716-446655440mno",
                    },
                ],
            },
        },
    };
}

// 创建响应式状态
export const scheduleEditorState = ref<ScheduleEditorStore>(
    {} as ScheduleEditorStore
);
export let scheduleEditorStore : PluginStore | null = null;
// 初始化和清理函数
export function initializeStore(store: PluginStore) {
    scheduleEditorState.value = createScheduleEditorStore();
    scheduleEditorStore = store;
}

export function clearStore() {
    scheduleEditorState.value = {} as ScheduleEditorStore;
    scheduleEditorStore = null;
}
