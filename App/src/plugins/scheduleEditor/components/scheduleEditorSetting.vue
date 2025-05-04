<script lang="ts" setup>
import SubjectEditor from "./profileConfig/subjectEditor/subjectEditor.vue";
import TimetableEditor from "./profileConfig/timetableEditor/timetableEditor.vue";
import CurriculumEditor from "./profileConfig/curriculumEditor/curriculumEditor.vue";
import TcButton from "../../../UI/TcButton.vue";
import TimeGroupEditor from "./profileConfig/timeGroupEditor/timeGroupEditor.vue";
import enableSelector from "./enableConfig/enableSelector.vue";
import type {ConfigType} from "../scheduleEditor";
import {scheduleEditorProps} from "../scheduleEditor";
import {computed, watch} from "vue";
import tempSelector from "./enableConfig/tempSelector.vue";
import logger from "../../../core/utils/logger";
import todayStatus from "./todayConfig/todayStatus.vue";
import todayEditor from "./todayConfig/todayEditor.vue";

interface TabConfig {
  label: string;
  component: any;
}

interface TabsConfig {
  [key: string]: TabConfig;
}


// 统一的tabs配置
const tabsConfig: Record<ConfigType, TabsConfig> = {
  course: {
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
  },
  enable: {
    enable: {
      label: "启用设置",
      component: enableSelector,
    },
    tempEnable: {
      label: "临时启用",
      component: tempSelector,
    },
  },
  todayConfig: {
    status: {
      label: "课表状态",
      component: todayStatus,
    },
    editor: {
      label: "今日设置",
      component: todayEditor,
    },
  },
};
const props = defineProps<scheduleEditorProps>()

const store = computed(() => props.plugin.storage!.content);

// 默认tab映射
const defaultTabs: Record<ConfigType, string> = {
  course: "subject",
  enable: "enable",
  todayConfig: "status",
};

// 监听configType变化，仅在必要时重置currentTab
watch(
    () => store.value.configType,
    (newType) => {
      if (!store || !newType) return;
      // 只有当前tab不在新类型的tabs中时，才重置为默认值
      const newTypeTabs = tabsConfig[newType as ConfigType];
      const currentTypeTab = store.value.currentTabs[newType as ConfigType];
      if (!currentTypeTab || !(currentTypeTab in newTypeTabs)) {
        store.value.currentTabs[newType as ConfigType] =
            defaultTabs[newType as ConfigType];
      }
    }
);

// 初始化currentTab
if (!store) {
  logger.error("[scheduleEditor] store未初始化");
} else if (store.value.configType) {
  const currentTabs = tabsConfig[store.value.configType as ConfigType];
  const currentTypeTab = store.value.currentTabs[store.value.configType as ConfigType];
  // 只有当前tab不存在时，才设置默认值
  if (!currentTypeTab || !(currentTypeTab in currentTabs)) {
    store.value.currentTabs[store.value.configType as ConfigType] =
        defaultTabs[store.value.configType as ConfigType];
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- 一级导航：配置类型切换 -->
    <div class="flex items-end justify-between gap-4">
      <div
          class="flex gap-1 bg-50 p-2 rounded-lg border border-gray-200 shadow-sm"
      >
        <tc-button
            v-for="(type, index) in ['todayConfig', 'enable', 'course']"
            :key="index"
            :variant="store.configType === type ? 'filled' : 'text'"
            size="medium"
            @click="store.configType = type as ConfigType"
        >
          {{
            type === "todayConfig"
                ? "今日课表"
                : type === "enable"
                    ? "启用配置"
                    : "配置课程"
          }}
        </tc-button>
      </div>

      <!-- 二级导航：通用tabs -->
      <div
          v-if="store.configType"
          class="flex gap-1 bg-100 px-1 py-1 rounded-t-lg border-x border-t border-gray-200"
      >
        <tc-button
            v-for="(tab, key) in tabsConfig[store.configType as ConfigType]"
            :key="key"
            :variant="store.currentTabs[store.configType as ConfigType] === key ? 'filled' : 'text'"
            size="small"
            @click="
                        store.currentTabs[store.configType as ConfigType] = key as string;
                    "
        >
          {{ tab.label }}
        </tc-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div
        v-if="store.configType && store.currentTabs[store.configType as ConfigType]"
        class="flex-1 min-h-0"
    >
      <component
          :is="tabsConfig[store.configType as ConfigType][store.currentTabs[store.configType as ConfigType]].component"
          class="h-full"
      />
    </div>
  </div>
</template>

<style scoped>
/*  */
</style>
