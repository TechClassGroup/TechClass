import {IPlugin} from "@/types/plugins";
import scheduleEditorSetting from "@/plugins/scheduleEditor/scheduleEditorComponents/scheduleEditorSetting.vue";
import {defineStore} from "pinia";
import {SubjectObject} from "@/plugins/scheduleEditor/scheduleEditorTypes.ts";

export const useScheduleEditorSetting = defineStore('useScheduleEditor', {
    state: () => {
        return {
            // 测试数据
            subjects: {
                "550e8400-e29b-41d4-a716-446655440000": {
                    name: "数学",
                    shortName: "数",
                    notes: "数学喵",
                    teacherName: "",
                    isActive: true,
                },
                "7a8b9c10-d11e-12f1-3g45-678901234567": {
                    name: "语文",
                    shortName: "语",
                    notes: "语文课",
                    teacherName: "王老师",
                    isActive: true,
                },
                "2c3d4e5f-6g7h-8i9j-0k1l-234567890abc": {
                    name: "英语",
                    shortName: "英",
                    notes: "英语课程",
                    teacherName: "李老师",
                    isActive: true,
                },
                "9d8c7b6a-5e4f-3g2h-1i0j-klmnopqrstuv": {
                    name: "物理",
                    shortName: "物",
                    notes: "物理实验课",
                    teacherName: "张老师",
                    isActive: false,
                },
                "3f4g5h6i-7j8k-9l0m-1n2o-pqrstuvwxyz1": {
                    name: "化学",
                    shortName: "化",
                    notes: "化学实验课",
                    teacherName: "陈老师",
                    isActive: true,
                },
            } as SubjectObject,

        }
    },
    getters: {},
    actions: {}
})

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
        settingPage: scheduleEditorSetting
    },
    hooks: {
        onMounted: () => {
            const store = useScheduleEditorSetting()
        },
        onUnmounted: () => {
            const store = useScheduleEditorSetting()
            store.$dispose()
        }

    }

}