<script lang="ts" setup>
import {ref} from "vue";
import TimetableEditorDisplay from "./timetableEditorDisplay.vue";
import TimetableLayoutList from "./timetableLayoutList.vue";
import TimetableLayoutChecker from "./timetableLayoutChecker.vue";
import {scheduleEditorProfile} from "../../../store/scheduleEditorProfile";

const timetables = scheduleEditorProfile.value.timetables;
const selectedTimetableId = ref<string>("");
const selectedLayoutId = ref<string>("");
</script>

<template>
  <div class="flex gap-4 h-full">
    <!-- 时间表列表 -->
    <div class="flex-1 max-w-60 flex flex-col">
      <div class="bg-50 rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">时间表</h2>
      </div>
      <div class="flex-1 bg-50 rounded-lg shadow-sm overflow-hidden">
        <TimetableEditorDisplay
            v-model:selected-timetable-id="selectedTimetableId"
            v-model:timetables="timetables"
        />
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="flex-1 max-w-96 flex flex-col">
      <div class="bg-50 rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">课程列表</h2>
      </div>
      <div class="flex-1 bg-50 rounded-lg shadow-sm overflow-hidden">
        <TimetableLayoutList
            v-model:selected-layout-id="selectedLayoutId"
            v-model:selected-timetable-id="selectedTimetableId"
            v-model:timetables="timetables"
        />
      </div>
    </div>

    <!-- 检查器 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-50 rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">详情</h2>
      </div>
      <div class="flex-1 bg-50 rounded-lg shadow-sm overflow-hidden">
        <TimetableLayoutChecker
            v-model:selected-layout-id="selectedLayoutId"
            v-model:selected-timetable-id="selectedTimetableId"
            v-model:timetables="timetables"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
</style>
