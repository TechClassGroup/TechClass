<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import {generateTodayConfig, isTodayConfigLoop, scheduleEditorTodayConfig,} from "../../store/todayConfigStore";
import {DateTime} from "luxon";
import TcButton from "../../../../UI/TcButton.vue";
import {scheduleEditorProfile} from "../../store/scheduleEditorProfile";

const currentDate = ref(DateTime.now());

// 每小时更新一次当前时间
let timer: number;

onMounted(() => {
  // 立即执行一次
  currentDate.value = DateTime.now();

  timer = setInterval(() => {
    currentDate.value = DateTime.now();
  }, 3600000); // 每小时更新一次
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const generateStatus = computed<"error_loop" | "not_yet" | "ok">(() => {
  if (isTodayConfigLoop.value) {
    return "error_loop";
  }
  if (
      !scheduleEditorTodayConfig.value?.generateDate ||
      scheduleEditorTodayConfig.value.generateDate
          .startOf("day")
          .toMillis() !== currentDate.value.startOf("day").toMillis()
  ) {
    return "not_yet";
  }
  return "ok";
});

const statusInfo = computed(() => {
  switch (generateStatus.value) {
    case "error_loop":
      return {
        text: "存在循环引用",
        color: "text-red-500",
        bgColor: "bg-red-50",
      };
    case "not_yet":
      return {
        text: "尚未生成",
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      };
    case "ok":
      return {
        text: "已生成",
        color: "text-green-500",
        bgColor: "bg-green-50",
      };
  }
});

const scheduleCount = computed(() => {
  if (!scheduleEditorTodayConfig.value?.schedule) return 0;
  return Object.keys(scheduleEditorTodayConfig.value.schedule).length;
});

// 获取当前使用的配置信息
const currentConfig = computed(() => {
  const profile = scheduleEditorProfile.value;
  const isTemp = (() => {
    if (!profile.enableConfig.tempSelected.enable) {
      return false;
    }
    if (
        !profile.enableConfig.tempSelected.startTime ||
        !profile.enableConfig.tempSelected.endTime
    ) {
      return false;
    }
    return (
        profile.enableConfig.tempSelected.startTime.startOf("day") <=
        currentDate.value.startOf("day") &&
        profile.enableConfig.tempSelected.endTime.startOf("day") >=
        currentDate.value.startOf("day")
    );
  })();

  const config = isTemp
      ? profile.enableConfig.tempSelected
      : profile.enableConfig.selected;

  let name: string;
  if (config.type === "curriculum") {
    name = profile.curriculums[config.id]?.name || "未知课表";
  } else {
    name = profile.timeGroups[config.id]?.name || "未知时间组";
  }

  return {
    isTemp,
    type: config.type === "curriculum" ? "课表" : "时间组",
    name,
    startTime: isTemp ? profile.enableConfig.tempSelected.startTime : null,
    endTime: isTemp ? profile.enableConfig.tempSelected.endTime : null,
  };
});

// 重新生成今日课表
async function regenerateTodaySchedule() {
  generateTodayConfig();
}
</script>

<template>
  <div class="flex gap-6 h-full">
    <!-- 左侧：状态和基本信息 -->
    <div class="flex-1 max-w-96 flex flex-col">
      <!-- 状态卡片 -->
      <div
          class="bg-50 rounded-lg p-2 mb-2 shadow-sm border border-gray-100"
      >
        <h2 class="text-lg font-medium px-2 text-center text-title">
          今日课表状态
        </h2>
      </div>
      <div
          class="flex-1 bg-50 rounded-lg shadow-sm border border-gray-100 overflow-hidden p-6"
      >
        <!-- 状态显示 -->
        <div
            :class="statusInfo.bgColor"
            class="flex items-center gap-4 p-5 rounded-xl mb-6 border transition-all duration-200"
        >
          <div class="flex-1">
            <div
                :class="statusInfo.color"
                class="text-lg font-semibold mb-1"
            >
              {{ statusInfo.text }}
            </div>
            <div
                v-if="scheduleEditorTodayConfig.generateDate"
                class="text-sm text-muted"
            >
              生成时间：{{
                scheduleEditorTodayConfig.generateDate.toFormat(
                    "yyyy-MM-dd HH:mm:ss"
                )
              }}
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="space-y-4">
          <div
              class="flex items-center justify-between p-4 bg-100 rounded-xl hover:bg-300 transition-colors duration-200"
          >
                        <span class="text-normal font-medium"
                        >今日课程数量</span
                        >
            <span class="font-medium text-title text-lg">{{
                scheduleCount
              }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：操作和生成状态 -->
    <div class="flex-1 flex flex-col">
      <!-- 操作卡片 -->
      <div
          class="bg-50 rounded-lg p-2 mb-2 shadow-sm border border-gray-100"
      >
        <h2 class="text-lg font-medium px-2 text-center text-title">
          操作
        </h2>
      </div>
      <div
          class="flex-1 bg-50 rounded-lg shadow-sm border border-gray-100 overflow-hidden p-6"
      >
        <!-- 重新生成按钮 -->
        <div class="mb-8">
          <TcButton
              class="w-full py-3 text-lg font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
              variant="filled"
              @click="regenerateTodaySchedule"
          >
            重新生成今日课表
          </TcButton>
        </div>

        <!-- 生成状态信息 -->
        <div class="space-y-4">
          <div class="text-sm font-medium text-normal">
            即将生成：
          </div>
          <div
              class="p-5 rounded-xl bg-100 flex flex-col gap-3 hover:bg-300 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <span class="text-normal">生成日期</span>
              <span class="font-medium text-title">{{
                  currentDate.toFormat("yyyy-MM-dd")
                }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-normal">使用配置</span>
              <span
                  :class="
                                    currentConfig.isTemp
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-green-100 text-green-700'
                                "
                  class="text-xs px-3 py-1 rounded-full font-medium"
              >
                                {{
                  currentConfig.isTemp
                      ? "临时配置"
                      : "默认配置"
                }}
                            </span>
            </div>
            <div class="flex items-center justify-between">
                            <span class="text-normal"
                            >使用{{ currentConfig.type }}</span
                            >
              <span class="font-medium text-title">{{
                  currentConfig.name
                }}</span>
            </div>
            <template v-if="currentConfig.isTemp">
              <div class="flex items-center justify-between">
                <span class="text-normal">临时配置时间</span>
                <span class="text-sm font-medium text-title">
                                    {{
                    currentConfig.startTime?.toFormat(
                        "MM-dd"
                    )
                  }}
                                    至
                                    {{
                    currentConfig.endTime?.toFormat("MM-dd")
                  }}
                                </span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
