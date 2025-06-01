<script lang="ts" setup>
import {timeGroupObject} from "../../../scheduleEditor.types";
import {v4 as uuidv4} from "uuid";
import TcButton from "../../../../../UI/TcButton.vue";
import {DateTime} from "luxon";

const selectedTimeGroupId = defineModel<string>("selectedTimeGroupId", {
  required: true,
});
const timeGroups = defineModel<timeGroupObject>("timeGroups", {
  required: true,
});

// 类型定义
type Granularity = "day" | "week" | "month";
type DayCycleGranularity = "week" | "month" | "custom";

// 添加粒度映射
const granularityMap = {
  day: "天",
  week: "周",
  month: "月",
} as const;

function getGranularityName(granularity: Granularity) {
  return granularityMap[granularity] || "未知";
}

function generateUniqueId(): string {
  let newId = uuidv4();
  while (newId in timeGroups.value) {
    newId = uuidv4();
  }
  return newId;
}

function addTimeGroup() {
  const newId = generateUniqueId();
  timeGroups.value[newId] = {
    name: "新时间组",
    granularity: "day",
    dayCycleGranularity: "custom",
    cycle: 1,
    startTime: DateTime.now().startOf("day"),
    layout: [
      {
        type: "curriculum",
        id: "",
      },
    ],
  };
  selectedTimeGroupId.value = newId;
}

function copyTimeGroup(id: string) {
  if (timeGroups.value[id]) {
    const newId = generateUniqueId();
    const sourceTimeGroup = timeGroups.value[id];
    timeGroups.value[newId] = {
      ...sourceTimeGroup,
      name: `${sourceTimeGroup.name} (副本)`,
      dayCycleGranularity: sourceTimeGroup.dayCycleGranularity || "week",
    };
    selectedTimeGroupId.value = newId;
  }
}

function deleteTimeGroup(id: string) {
  if (timeGroups.value[id]) {
    delete timeGroups.value[id];
    if (selectedTimeGroupId.value === id) {
      selectedTimeGroupId.value = "";
    }
  }
}

function getTimeGroupInfo(timeGroup: (typeof timeGroups.value)[string]) {
  const parts: string[] = [];

  if (timeGroup.granularity === "day") {
    // 天粒度时，显示预设类型
    const presetMap: Record<DayCycleGranularity, string> = {
      week: "按周循环",
      month: "按月循环",
      custom: `自定义 ${timeGroup.cycle} 天循环`,
    };
    parts.push(presetMap[timeGroup.dayCycleGranularity]);
  } else {
    // 其他粒度时，显示总数
    parts.push(
        `共 ${timeGroup.cycle} ${getGranularityName(
            timeGroup.granularity as Granularity
        )}`
    );
  }

  // 只在非day粒度或custom预设时显示开始时间信息
  if (
      timeGroup.granularity !== "day" ||
      timeGroup.dayCycleGranularity === "custom"
  ) {
    if (timeGroup.startTime) {
      parts.push(`${timeGroup.startTime.toFormat("yyyy-MM-dd")}`);
    } else {
      parts.push("继承开始时间");
    }
  }

  return parts.join(" / ");
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 操作按钮 -->
    <div class="p-2 flex gap-2 border-b border-gray-200">
      <TcButton class="flex-1" variant="filled" @click="addTimeGroup">
        添加
      </TcButton>
      <TcButton
          :disabled="!selectedTimeGroupId"
          class="flex-1"
          variant="tonal"
          @click="copyTimeGroup(selectedTimeGroupId)"
      >
        复制
      </TcButton>
      <TcButton
          :disabled="!selectedTimeGroupId"
          class="flex-1"
          color="error"
          variant="tonal"
          @click="deleteTimeGroup(selectedTimeGroupId)"
      >
        删除
      </TcButton>
    </div>

    <!-- 时间组列表 -->
    <div class="flex-1 overflow-y-auto scrollbar-stable bg-100">
      <div class="flex flex-col gap-2 p-2 rounded-lg h-full">
        <TransitionGroup
            class="flex flex-col gap-2"
            name="list"
            tag="div"
        >
          <div
              v-for="(timeGroup, id) in timeGroups"
              :key="id"
              :class="[
                            selectedTimeGroupId === id
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-normal hover:bg-500 hover:translate-x-1',
                        ]"
              class="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
              @click="selectedTimeGroupId = id as string"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center">
                <div class="flex items-center gap-2">
                                    <span
                                        class="font-medium break-all whitespace-normal"
                                    >{{ timeGroup.name }}</span
                                    >
                </div>
              </div>
              <div class="text-xs text-muted pl-0.5">
                {{ getTimeGroupInfo(timeGroup) }}
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-move {
  transition: transform 0.3s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.list-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
