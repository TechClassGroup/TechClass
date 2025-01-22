<script setup lang="ts">
import { ref } from "vue";
import { scheduleEditorState } from "@/plugins/scheduleEditor/scheduleEditor";
import TimetableEditorDisplay from "./timetableEditorDisplay.vue";
import TimetableLayoutList from "./timetableLayoutList.vue";
import TimetableLayoutChecker from "./timetableLayoutChecker.vue";

const timetables = scheduleEditorState.value.timetables;
const selectedTimetableId = ref<string>("");
const selectedLayoutId = ref<string>("");
</script>

<template>
    <div class="flex gap-4 h-[100%]">
        <!-- 时间表列表 -->
        <div
            class="flex-1 max-w-60 bg-white rounded-lg shadow-md overflow-hidden"
        >
            <div class="p-4 bg-primary-600 text-white">
                <h2 class="text-lg font-medium">时间表</h2>
            </div>
            <TimetableEditorDisplay
                v-model:selected-timetable-id="selectedTimetableId"
                v-model:timetables="timetables"
            />
        </div>

        <!-- 课程列表 -->
        <div
            class="flex-1 max-w-96 bg-white rounded-lg shadow-md overflow-hidden"
        >
            <div class="p-4 bg-primary-600 text-white">
                <h2 class="text-lg font-medium">课程列表</h2>
            </div>
            <TimetableLayoutList
                v-model:selected-timetable-id="selectedTimetableId"
                v-model:selected-layout-id="selectedLayoutId"
                v-model:timetables="timetables"
            />
        </div>

        <!-- 检查器 -->
        <div class="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-4 bg-primary-600 text-white">
                <h2 class="text-lg font-medium">课程详情</h2>
            </div>
            <TimetableLayoutChecker
                v-model:selected-timetable-id="selectedTimetableId"
                v-model:selected-layout-id="selectedLayoutId"
                v-model:timetables="timetables"
            />
        </div>
    </div>
</template>

<style scoped>
.bg-primary-600 {
    background-color: #1976d2;
}

:deep(.scrollbar-stable) {
    scrollbar-gutter: stable;
}

:deep(.scrollbar-stable::-webkit-scrollbar) {
    width: 8px;
}

:deep(.scrollbar-stable::-webkit-scrollbar-track) {
    background: transparent;
}

:deep(.scrollbar-stable::-webkit-scrollbar-thumb) {
    background-color: #d1d5db;
    border-radius: 4px;
}

:deep(.scrollbar-stable::-webkit-scrollbar-thumb:hover) {
    background-color: #9ca3af;
}
</style>
