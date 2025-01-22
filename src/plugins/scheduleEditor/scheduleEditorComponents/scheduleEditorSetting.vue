<script lang="ts" setup>
import SubjectEditor from "@/plugins/scheduleEditor/scheduleEditorComponents/subjectEditor.vue";
import TimetableEditor from "@/plugins/scheduleEditor/scheduleEditorComponents/timetableEditor.vue";
import TcButton from "@/UI/TcButton.vue";
import { ref } from "vue";

const currentTab = ref<"subject" | "timetable">("subject");
const tabs = [
    { key: "subject", label: "课程编辑" },
    { key: "timetable", label: "时间表编辑" },
] as const;
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <!-- 切换按钮组 -->
        <div
            class="flex gap-1 bg-gray-50 p-1 rounded-lg w-fit border border-gray-200 shadow-sm"
        >
            <tc-button
                v-for="tab in tabs"
                :key="tab.key"
                size="small"
                :variant="currentTab === tab.key ? 'filled' : 'text'"
                @click="currentTab = tab.key"
            >
                {{ tab.label }}
            </tc-button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 min-h-0">
            <component
                :is="currentTab === 'subject' ? SubjectEditor : TimetableEditor"
                class="h-full"
            />
        </div>
    </div>
</template>

<style scoped>
/*  */
</style>
