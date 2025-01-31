<script lang="ts" setup>
import SubjectEditor from "./subjectEditor/subjectEditor.vue";
import TimetableEditor from "./timetableEditor/timetableEditor.vue";
import CurriculumEditor from "./curriculumEditor/curriculumEditor.vue";
import TcButton from "../../../UI/TcButton.vue";
import TimeGroupEditor from "./timeGroupEditor/timeGroupEditor.vue";
import {scheduleEditorStore} from "../store/scheduleStore";
import {watch} from "vue";

const courseTabs = {
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
  },
} as const;
const today_tabs = {
  basic: {
    label: "基础设置",
    component: SubjectEditor,
  },
  advanced: {
    label: "高级设置",
    component: TimetableEditor,
  },
} as const;
const store = scheduleEditorStore;
type courseTabKey = keyof typeof courseTabs;
type todayTabKey = keyof typeof today_tabs;

// 配置类型切换
type ConfigType = "course" | "today";

// 监听configType变化，重置currentTab
watch(
    () => store.configType,
    (newType) => {
      if (newType === "course") {
        store.currentTab = "subject";
      } else {
        store.currentTab = "basic";
      }
    }
);

// 初始化currentTab
if (store.configType === "course") {
  store.currentTab = "subject";
} else {
  store.currentTab = "basic";
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- 一级导航：配置类型切换 -->
    <div class="flex items-end justify-between gap-4">
      <div
          class="flex gap-1 bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
      >
        <tc-button
            size="medium"
            :variant="store.configType as ConfigType === 'today' ? 'filled' : 'text'"
            @click="store.configType = 'today'"
        >
          今日设置
        </tc-button>
        <tc-button
            size="medium"
            :variant="store.configType as ConfigType === 'course' ? 'filled' : 'text'"
            @click="store.configType = 'course'"
        >
          配置课程
        </tc-button>
      </div>

      <!-- 二级导航：课程配置相关tabs -->
      <div
          v-if="store.configType as ConfigType === 'course'"
          class="flex gap-1 bg-gray-50 px-1 py-1 rounded-t-lg border-x border-t border-gray-200"
      >
        <tc-button
            v-for="(tab, key) in courseTabs"
            :key="key"
            :variant="store.currentTab as courseTabKey === key ? 'filled' : 'text'"
            size="small"
            @click="store.currentTab = key"
        >
          {{ tab.label }}
        </tc-button>
      </div>

      <!-- 二级导航：今日设置相关tabs -->
      <div
          v-if="store.configType as ConfigType === 'today'"
          class="flex gap-1 bg-gray-50 px-1 py-1 rounded-t-lg border-x border-t border-gray-200"
      >
        <tc-button
            v-for="(tab, key) in today_tabs"
            :key="key"
            size="small"
            :variant="store.currentTab as todayTabKey === key ? 'filled' : 'text'"
            @click="store.currentTab = key"
        >
          {{ tab.label }}
        </tc-button>
      </div>
    </div>

    <!-- 课程配置相关内容 -->
    <template v-if="store.configType as ConfigType === 'course'">
      <div class="flex-1 min-h-0">
        <component
            :is="courseTabs[store.currentTab as courseTabKey].component"
            class="h-full"
        />
      </div>
    </template>

    <!-- 今日设置相关内容 -->
    <template v-else>
      <div class="flex-1 min-h-0">
        <component
            :is="today_tabs[store.currentTab as todayTabKey].component"
            class="h-full"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
/*  */
</style>
