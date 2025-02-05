<script lang="ts" setup>
import SubjectEditor from "./profileConfig/subjectEditor/subjectEditor.vue";
import TimetableEditor from "./profileConfig/timetableEditor/timetableEditor.vue";
import CurriculumEditor from "./profileConfig/curriculumEditor/curriculumEditor.vue";
import TcButton from "../../../UI/TcButton.vue";
import TimeGroupEditor from "./profileConfig/timeGroupEditor/timeGroupEditor.vue";
import enableSelector from "./enableConfig/enableSelector.vue";
import {scheduleEditorStore} from "../store/scheduleStore";
import {watch} from "vue";
import tempSelector from "./enableConfig/tempSelector.vue";
import logger from "../../../modules/logger";

const profileTabs = {
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
const enableTabs = {

  enable: {
    label: "启用设置",
    component: enableSelector,
  },
  tempEnable: {
    label: "临时启用",
    component: tempSelector,
  },
} as const;
const store = scheduleEditorStore!;

type profileTabKey = keyof typeof profileTabs;
type enableTabKey = keyof typeof enableTabs;

// 配置类型切换
type ConfigType = "course" | "enable";

// 监听configType变化，重置currentTab
watch(
    () => store?.configType,
    (newType) => {
      if (!store) return;
      if (newType === "course") {
        store.currentTab = "subject";
      } else {
        store.currentTab = "enable";
      }
    }
);

// 初始化currentTab
if (!store) {
  logger.error("[scheduleEditor] store未初始化");
} else {
  if (store.configType === "course") {
    store.currentTab = "subject";
  } else {
    store.currentTab = "enable";
  }
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
            :variant="store.configType as ConfigType === 'enable' ? 'filled' : 'text'"
            @click="store.configType = 'enable'"
        >
          启用配置
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
            v-for="(tab, key) in profileTabs"
            :key="key"
            :variant="store.currentTab as profileTabKey === key ? 'filled' : 'text'"
            size="small"
            @click="store.currentTab = key"
        >
          {{ tab.label }}
        </tc-button>
      </div>

      <!-- 二级导航：今日设置相关tabs -->
      <div
          v-if="store.configType as ConfigType === 'enable'"
          class="flex gap-1 bg-gray-50 px-1 py-1 rounded-t-lg border-x border-t border-gray-200"
      >
        <tc-button
            v-for="(tab, key) in enableTabs"
            :key="key"
            size="small"
            :variant="store.currentTab as enableTabKey === key ? 'filled' : 'text'"
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
            :is="profileTabs[store.currentTab as profileTabKey].component"
            class="h-full"
        />
      </div>
    </template>

    <!-- 今日设置相关内容 -->
    <template v-else>
      <div class="flex-1 min-h-0">
        <component
            :is="enableTabs[store.currentTab as enableTabKey].component"
            class="h-full"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
/*  */
</style>
