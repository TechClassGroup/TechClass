<script setup lang="ts">
import CurriculumEditorList from "./curriculumEditorList.vue";
import CurriculumEditorDisplay from "./curriculumEditorDisplay.vue";
import CurriculumEditorChecker from "./curriculumEditorChecker.vue";
</script>

<template>
    <div class="flex gap-4 h-[100%]">

        <div class="w-1/4 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg">
                <div class="p-2 flex gap-2 border-b border-gray-200">
                    <div class="text-lg font-medium text-center">左侧面板</div>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <curriculum-editor-list />
            </div>
        </div>


        <div class="flex-1 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg">
                <div class="p-2 flex gap-2 border-b border-gray-200">
                    <div class="text-lg font-medium text-center">中间面板</div>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
               <curriculum-editor-display></curriculum-editor-display>
            </div>
        </div>


        <div class="w-1/4 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg">
                <div class="p-2 flex gap-2 border-b border-gray-200">
                    <div class="text-lg font-medium text-center">右侧面板</div>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <curriculum-editor-checker></curriculum-editor-checker>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 可以在这里添加额外的样式 */
</style>
