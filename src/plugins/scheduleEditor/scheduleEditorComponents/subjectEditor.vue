<script lang="ts" setup>
import { Ref, ref } from "vue";
import { SubjectObject } from "@/plugins/scheduleEditor/scheduleEditorTypes.ts";
import SubjectDisplay from "./subjectDisplay.vue";
import SubjectChecker from "./subjectChecker.vue";
import { v4 as uuidv4 } from "uuid";

const subjects: Ref<SubjectObject> = ref({
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
});

const selectedSubjectId = ref<string>("");

function handleSubjectSelect(id: string) {
    selectedSubjectId.value = id;
}

function handleSubjectUpdate(
    id: string,
    field: keyof SubjectObject[string],
    value: string | boolean
) {
    if (subjects.value[id]) {
        subjects.value[id] = {
            ...subjects.value[id],
            [field]: value,
        };
    }
}

function generateUniqueId(): string {
    let newId = uuidv4();
    while (newId in subjects.value) {
        newId = uuidv4();
    }
    return newId;
}

function copySubject(id: string) {
    if (subjects.value[id]) {
        const newId = generateUniqueId();
        subjects.value[newId] = {
            ...subjects.value[id],
            name: `${subjects.value[id].name} (副本)`,
        };
        selectedSubjectId.value = newId;
    }
}

function addSubject() {
    const newId = generateUniqueId();
    subjects.value[newId] = {
        name: "新科目",
        shortName: "新",
        notes: "",
        teacherName: "",
        isActive: true,
    };
    selectedSubjectId.value = newId;
}

function deleteSubject(id: string) {
    if (subjects.value[id]) {
        delete subjects.value[id];
        if (selectedSubjectId.value === id) {
            selectedSubjectId.value = "";
        }
    }
}
</script>

<template>
    <div class="flex gap-4 h-[100%]">
        <div class="flex-1 max-w-60 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 flex gap-2 shadow-sm">
                <button
                    class="flex-1 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
                    @click="addSubject"
                >
                    添加
                </button>
                <button
                    class="flex-1 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
                    @click="copySubject(selectedSubjectId)"
                    :disabled="!selectedSubjectId"
                >
                    复制
                </button>
                <button
                    class="flex-1 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors text-red-600"
                    @click="deleteSubject(selectedSubjectId)"
                    :disabled="!selectedSubjectId"
                >
                    删除
                </button>
            </div>
            <SubjectDisplay
                :selected-subject-id="selectedSubjectId"
                :subjects="subjects"
                class="flex-1 break-all overflow-y-auto scrollbar-stable"
                @select="handleSubjectSelect"
            />
        </div>
        <div
            class="flex-1 bg-white rounded-lg flex flex-col overflow-y-auto scrollbar-stable"
        >
            <SubjectChecker
                :subject="subjects[selectedSubjectId]"
                :subject-id="selectedSubjectId"
                class="flex-1 break-all"
                @update="handleSubjectUpdate"
            />
        </div>
    </div>
</template>

<style scoped>
:deep(input),
:deep(textarea) {
    word-wrap: break-word;
    word-break: break-all;
    overflow-wrap: break-word;
}

.scrollbar-stable {
    scrollbar-gutter: stable;
}

/* 自定义滚动条样式 */
.scrollbar-stable::-webkit-scrollbar {
    width: 8px;
}

.scrollbar-stable::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-stable::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 4px;
}

.scrollbar-stable::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af;
}
</style>
