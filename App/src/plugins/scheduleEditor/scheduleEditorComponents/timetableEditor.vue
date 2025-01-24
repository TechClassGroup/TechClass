<script setup lang="ts">
import { ref } from "vue";
import { scheduleEditorState } from "../scheduleStore";
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
        <div class="flex-1 max-w-60 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">时间表</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <TimetableEditorDisplay
                    v-model:selected-timetable-id="selectedTimetableId"
                    v-model:timetables="timetables"
                />
            </div>
        </div>

        <!-- 课程列表 -->
        <div class="flex-1 max-w-96 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">课程列表</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <TimetableLayoutList
                    v-model:selected-timetable-id="selectedTimetableId"
                    v-model:selected-layout-id="selectedLayoutId"
                    v-model:timetables="timetables"
                />
            </div>
        </div>

        <!-- 检查器 -->
        <div class="flex-1 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">课程详情</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <TimetableLayoutChecker
                    v-model:selected-timetable-id="selectedTimetableId"
                    v-model:selected-layout-id="selectedLayoutId"
                    v-model:timetables="timetables"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
</style>
