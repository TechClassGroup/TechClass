<script lang="ts" setup>
import { ref } from "vue";
import { SubjectObject } from "@/plugins/scheduleEditor/scheduleEditorTypes.ts";
import SubjectEditorDisplay from "./subjectEditorDisplay.vue";
import SubjectEditorChecker from "./subjectEditorChecker.vue";
import { v4 as uuidv4 } from "uuid";
import { scheduleEditorState } from "@/plugins/scheduleEditor/scheduleStore";
import TcButton from "@/UI/TcButton.vue";

const subjects = scheduleEditorState.value.subjects;

const selectedSubjectId = ref<string>("");

function handleSubjectSelect(id: string) {
    selectedSubjectId.value = id;
}

function handleSubjectUpdate(
    id: string,
    field: keyof SubjectObject[string],
    value: string | boolean
) {
    if (subjects[id]) {
        subjects[id] = {
            ...subjects[id],
            [field]: value,
        };
    }
}

function generateUniqueId(): string {
    let newId = uuidv4();
    while (newId in subjects) {
        newId = uuidv4();
    }
    return newId;
}

function copySubject(id: string) {
    if (subjects[id]) {
        const newId = generateUniqueId();
        subjects[newId] = {
            ...subjects[id],
            name: `${subjects[id].name} (副本)`,
        };
        selectedSubjectId.value = newId;
    }
}

function addSubject() {
    const newId = generateUniqueId();
    subjects[newId] = {
        name: "新科目",
        shortName: "新",
        notes: "",
        teacherName: "",
        isActive: true,
    };
    selectedSubjectId.value = newId;
}

function deleteSubject(id: string) {
    if (subjects[id]) {
        // 清理所有引用了该课程的时间表
        Object.values(scheduleEditorState.value.timetables).forEach(
            (timetable) => {
                Object.values(timetable.layouts).forEach((layout) => {
                    if (layout.type === "lesson" && layout.subjectId === id) {
                        layout.subjectId = "";
                    }
                });
            }
        );

        // 删除课程
        delete subjects[id];
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
                <TcButton class="flex-1" variant="filled" @click="addSubject">
                    添加
                </TcButton>
                <TcButton
                    class="flex-1"
                    variant="tonal"
                    @click="copySubject(selectedSubjectId)"
                    :disabled="!selectedSubjectId"
                >
                    复制
                </TcButton>
                <TcButton
                    class="flex-1"
                    variant="tonal"
                    color="error"
                    @click="deleteSubject(selectedSubjectId)"
                    :disabled="!selectedSubjectId"
                >
                    删除
                </TcButton>
            </div>
            <SubjectEditorDisplay
                :selected-subject-id="selectedSubjectId"
                :subjects="subjects"
                class="flex-1 break-all overflow-y-auto"
                @select="handleSubjectSelect"
            />
        </div>
        <div class="flex-1 bg-white rounded-lg flex flex-col overflow-y-auto">
            <SubjectEditorChecker
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
</style>
