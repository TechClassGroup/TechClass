<script setup lang="ts">
import {ref} from "vue";
import TimeGroupDisplay from "./timeGroupDisplay.vue";
import TimeGroupLayoutList from "./timeGroupLayoutList.vue";
import TimeGroupChecker from "./timeGroupChecker.vue";
import {scheduleEditorProfile} from "../../../store/scheduleEditorProfile";

const selectedTimeGroupId = ref<string>("");
const selectedLayoutIndex = ref<number>(-1);

const timeGroups = scheduleEditorProfile.value.timeGroups;
</script>

<template>
    <div class="flex gap-4 h-[100%]">
        <!-- 时间组列表 -->
        <div class="flex-1 max-w-60 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">时间组</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <TimeGroupDisplay
                    v-model:selected-time-group-id="selectedTimeGroupId"
                    v-model:time-groups="timeGroups"
                />
            </div>
        </div>

        <!-- 布局列表 -->
        <div class="flex-1 max-w-96 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">布局列表</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <TimeGroupLayoutList
                    v-model:selected-time-group-id="selectedTimeGroupId"
                    v-model:selected-layout-index="selectedLayoutIndex"
                    v-model:time-groups="timeGroups"
                />
            </div>
        </div>

        <!-- 检查器 -->
        <div class="flex-1 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">详情</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <TimeGroupChecker
                    v-model:selected-time-group-id="selectedTimeGroupId"
                    v-model:time-groups="timeGroups"
                />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
