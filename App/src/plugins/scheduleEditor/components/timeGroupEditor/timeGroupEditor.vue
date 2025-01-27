<script setup lang="ts">
import { ref } from "vue";
import { scheduleEditorState } from "../../scheduleStore";

const timeGroups = scheduleEditorState.value.timeGroups;
const selectedTimeGroupId = ref<string>("");
const selectedTimeId = ref<string>("");
</script>

<template>
    <div class="flex gap-4 h-[100%]">
        <!-- 时间组列表 -->
        <div class="flex-1 max-w-60 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">时间组</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- TimeGroupDisplay组件将在这里 -->
            </div>
        </div>

        <!-- 时间段列表 -->
        <div class="flex-1 max-w-96 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">时间段列表</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- TimeList组件将在这里 -->
            </div>
        </div>

        <!-- 检查器 -->
        <div class="flex-1 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">详情</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- TimeChecker组件将在这里 -->
            </div>
        </div>
    </div>
</template>

<style scoped></style>
