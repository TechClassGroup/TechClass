<script setup lang="ts">
import { ref } from "vue";
import CurriculumEditorList from "./curriculumEditorList.vue";
import CurriculumEditorDisplay from "./curriculumEditorDisplay.vue";
import CurriculumEditorChecker from "./curriculumEditorChecker.vue";

const selectedCurriculumId = ref("");
</script>

<template>
    <div class="flex gap-4 h-[100%]">
        <!-- 课程表列表 -->
        <div class="flex-1 max-w-60 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">课程表列表</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <curriculum-editor-list
                    v-model:selected-curriculum-id="selectedCurriculumId"
                />
            </div>
        </div>

        <!-- 课程表详情 -->
        <div class="flex-1 max-w-96 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">课程表详情</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <curriculum-editor-display
                    v-model:selected-curriculum-id="selectedCurriculumId"
                />
            </div>
        </div>

        <!-- 课程表设置 -->
        <div class="flex-1 flex flex-col">
            <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
                <h2 class="text-lg font-medium px-2 text-center">课程表设置</h2>
            </div>
            <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <curriculum-editor-checker
                    v-model:selected-curriculum-id="selectedCurriculumId"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
