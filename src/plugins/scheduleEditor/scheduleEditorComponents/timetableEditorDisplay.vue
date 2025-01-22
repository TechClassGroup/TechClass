<script setup lang="ts">
import { TimetableObject } from "@/plugins/scheduleEditor/scheduleEditorTypes";
import { v4 as uuidv4 } from "uuid";
import TcButton from "@/UI/TcButton.vue";

const selectedTimetableId = defineModel<string | number>(
    "selectedTimetableId",
    {
        required: true,
    }
);
const timetables = defineModel<TimetableObject>("timetables", {
    required: true,
});

function generateUniqueId(): string {
    let newId = uuidv4();
    while (newId in timetables.value) {
        newId = uuidv4();
    }
    return newId;
}

function addTimetable() {
    const newId = generateUniqueId();
    timetables.value[newId] = {
        name: "新时间表",
        layouts: {},
    };
    selectedTimetableId.value = newId;
}

function copyTimetable(id: string | number) {
    if (timetables.value[id]) {
        const newId = generateUniqueId();
        timetables.value[newId] = {
            ...timetables.value[id],
            name: `${timetables.value[id].name} (副本)`,
        };
        selectedTimetableId.value = newId;
    }
}

function deleteTimetable(id: string | number) {
    if (timetables.value[id]) {
        delete timetables.value[id];
        if (selectedTimetableId.value === id) {
            selectedTimetableId.value = "";
        }
    }
}

</script>

<template>
    <div class="flex flex-col h-full">
        <!-- 操作按钮 -->
        <div class="p-2 flex gap-2 border-b border-gray-200">
            <TcButton class="flex-1" variant="filled" @click="addTimetable">
                添加
            </TcButton>
            <TcButton
                class="flex-1"
                variant="tonal"
                :disabled="!selectedTimetableId"
                @click="copyTimetable(selectedTimetableId)"
            >
                复制
            </TcButton>
            <TcButton
                class="flex-1"
                variant="tonal"
                :disabled="!selectedTimetableId"
                color="error"
                @click="deleteTimetable(selectedTimetableId)"
            >
                删除
            </TcButton>
        </div>

        <!-- 时间表列表 -->
        <div class="flex-1 overflow-y-auto scrollbar-stable">
            <div
                v-for="(timetable, id) in timetables"
                :key="id"
                class="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 relative"
                :class="{ 'bg-blue-50': id === selectedTimetableId }"
                @click="selectedTimetableId = id"
            >
                <div class="font-medium text-gray-900">
                    {{ timetable.name }}
                </div>
                <div class="text-sm text-gray-500 mt-1">
                    {{ Object.keys(timetable.layouts).length }} 个课程
                </div>
                <div
                    v-if="id === selectedTimetableId"
                    class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
