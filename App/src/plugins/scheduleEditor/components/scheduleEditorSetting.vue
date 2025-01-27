<script lang="ts" setup>
import SubjectEditor from "./subjectEditor/subjectEditor.vue";
import TimetableEditor from "./timetableEditor/timetableEditor.vue";
import CurriculumEditor from "./curriculumEditor/curriculumEditor.vue";
import TcButton from "../../../UI/TcButton.vue";
import {ref} from "vue";
import TimeGroupEditor from "./timeGroupEditor/timeGroupEditor.vue";

const tabs = {
  subject: {
    label: "课程编辑",
    component: SubjectEditor,
  },
  timetable: {
    label: "时间表编辑",
    component: TimetableEditor,
  },
  curriculum: {
    label: "课表编辑",
    component: CurriculumEditor,
  },
  timegroup: {
    label: "时间组编辑",
    component: TimeGroupEditor,
  }
} as const;

type TabKey = keyof typeof tabs;
const currentTab = ref<TabKey>("subject");
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- 切换按钮组 -->
    <div
        class="flex gap-1 bg-gray-50 p-1 rounded-lg w-fit border border-gray-200 shadow-sm"
    >
      <tc-button
          v-for="(tab, key) in tabs"
          :key="key"
          size="small"
          :variant="currentTab === key ? 'filled' : 'text'"
          @click="currentTab = key"
      >
        {{ tab.label }}
      </tc-button>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 min-h-0">
      <component :is="tabs[currentTab].component" class="h-full" />
    </div>
  </div>
</template>

<style scoped>
/*  */
</style>
