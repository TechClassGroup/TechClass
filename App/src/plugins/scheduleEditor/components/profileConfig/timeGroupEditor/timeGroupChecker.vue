<script setup lang="ts">
import {computed} from "vue";
import type {timeGroupObject} from "../../../scheduleEditor.types";
import TcInput from "../../../../../UI/TcInput.vue";
import TcSwitch from "../../../../../UI/TcSwitch.vue";
import {DateTime} from "luxon";

// 类型定义
type Granularity = "day" | "week" | "month";
type DayCycleGranularity = "week" | "month" | "custom";

// Props 定义
const selectedTimeGroupId = defineModel<string>("selectedTimeGroupId", {
    required: true,
});
const timeGroups = defineModel<timeGroupObject>("timeGroups", {
    required: true,
});

// 常量映射
const GRANULARITY_MAP = {
    day: "天",
    week: "周",
    month: "月",
} as const;

const DAY_CYCLE_GRANULARITY_MAP = {
  week: "周",
  month: "月",
  custom: "自定义",
} as const;

// 组合式函数：时间组管理
const useTimeGroup = () => {
  const currentTimeGroup = computed(() => {
    if (
        !selectedTimeGroupId.value ||
        !timeGroups.value[selectedTimeGroupId.value]
    ) {
      return null;
    }
    return timeGroups.value[selectedTimeGroupId.value];
  });

  const updateTimeGroup = {
    name: (name: string) => {
      if (!currentTimeGroup.value) return;
      currentTimeGroup.value.name = name;
    },

    granularity: (granularity: Granularity) => {
      if (!currentTimeGroup.value) return;
      currentTimeGroup.value.granularity = granularity;

      if (granularity === "day") {
        if (!currentTimeGroup.value.dayCycleGranularity) {
          currentTimeGroup.value.dayCycleGranularity = "week";
        }

        if (currentTimeGroup.value.dayCycleGranularity !== "custom") {
          const cycleMap = {week: 7, month: 31};
          updateTimeGroup.cycle(
              cycleMap[currentTimeGroup.value.dayCycleGranularity]
          );
        }
      }
    },

    dayCycleGranularity: (value: DayCycleGranularity) => {
      if (!currentTimeGroup.value) return;
      currentTimeGroup.value.dayCycleGranularity = value;

      if (value !== "custom") {
        const cycleMap = {week: 7, month: 31};
        updateTimeGroup.cycle(cycleMap[value]);
      }
    },

    cycle: (cycle: number) => {
      if (!currentTimeGroup.value) return;
      const newCycle = Math.max(1, Math.floor(Math.abs(cycle)));
      currentTimeGroup.value.cycle = newCycle;

      // 调整布局数组长度
      const layout = currentTimeGroup.value.layout;
      if (layout.length > newCycle) {
        layout.length = newCycle;
      } else {
        while (layout.length < newCycle) {
          layout.push({type: "curriculum", id: ""});
        }
      }
    },

    startTime: (dateStr: string) => {
      if (!currentTimeGroup.value) return;
      const newDate = DateTime.fromISO(dateStr);
      if (newDate.isValid) {
        currentTimeGroup.value.startTime = newDate;
      }
    },

    startTimeInherit: (inherit: boolean) => {
      if (!currentTimeGroup.value) return;
      currentTimeGroup.value.startTime = inherit
          ? null
          : DateTime.now().startOf("day");
    },
  };

  return {
    currentTimeGroup,
    updateTimeGroup,
  };
};

// 组合式函数：计算属性
const useComputedProperties = (
    currentTimeGroup: ReturnType<typeof useTimeGroup>["currentTimeGroup"]
) => {
  const isInheritStartTime = computed(
      () => currentTimeGroup.value?.startTime === null
  );

  const formattedStartTime = computed(() => {
    if (!currentTimeGroup.value?.startTime)
      return DateTime.now().toFormat("yyyy-MM-dd");
    return currentTimeGroup.value.startTime.toFormat("yyyy-MM-dd");
  });

  const showCycleInput = computed(() => {
    if (!currentTimeGroup.value) return false;
    return (
        currentTimeGroup.value.granularity !== "day" ||
        currentTimeGroup.value.dayCycleGranularity === "custom"
    );
  });

  const showStartTimeSettings = computed(() => {
    if (!currentTimeGroup.value) return false;
    return (
        currentTimeGroup.value.granularity !== "day" ||
        currentTimeGroup.value.dayCycleGranularity === "custom"
    );
  });

  return {
    isInheritStartTime: computed(() => isInheritStartTime.value),
    formattedStartTime: computed(() => formattedStartTime.value),
    showCycleInput,
    showStartTimeSettings,
  };
};

// 组件逻辑组合
const {currentTimeGroup, updateTimeGroup} = useTimeGroup();
const computedProps = useComputedProperties(currentTimeGroup);
</script>

<template>
    <div class="p-4">
        <div v-if="currentTimeGroup" class="space-y-6">
            <!-- 时间组名称 -->
            <div>
              <label class="block text-sm font-medium text-normal mb-1"
                    >时间组名称</label
                >
                <TcInput
                    :model-value="currentTimeGroup.name"
                    placeholder="请输入时间组名称"
                    @update:model-value="updateTimeGroup.name"
                />
            </div>

            <!-- 粒度设置 -->
            <div>
              <label class="block text-sm font-medium text-normal mb-1"
                    >时间粒度</label
                >
                <select
                    :value="currentTimeGroup.granularity"
                    class="form-select"
                    @change="(e: Event) => updateTimeGroup.granularity((e.target as HTMLSelectElement).value as Granularity)"
                >
                    <option
                        v-for="(name, value) in GRANULARITY_MAP"
                        :key="value"
                        :value="value"
                    >
                        {{ name }}
                    </option>
                </select>
            </div>

          <!-- 天的预设周期 -->
          <div v-if="currentTimeGroup.granularity === 'day'">
            <label class="block text-sm font-medium text-normal mb-1"
            >天的预设周期</label
            >
            <select
                :value="currentTimeGroup.dayCycleGranularity"
                class="form-select"
                @change="(e: Event) => updateTimeGroup.dayCycleGranularity((e.target as HTMLSelectElement).value as DayCycleGranularity)"
            >
              <option
                  v-for="(name, value) in DAY_CYCLE_GRANULARITY_MAP"
                  :key="value"
                  :value="value"
              >
                {{ name }}
              </option>
            </select>
          </div>

          <!-- 周期设置 -->
          <div v-if="computedProps.showCycleInput.value">
            <label class="block text-sm font-medium text-normal mb-1"
                    >周期</label
                >
                <TcInput
                    type="number"
                    :model-value="String(currentTimeGroup.cycle)"
                    step="1"
                    @input="(e: Event) => {
                        const input = e.target as HTMLInputElement;
                        const value = input.value.replace(/\D/g, '');
                        const num = Number(value) || 1;
                        const limitedNum = Math.max(1, Math.min(1000, num));
                        input.value = String(limitedNum);
                        updateTimeGroup.cycle(limitedNum);
                    }"
                />
            <p class="mt-1 text-sm text-muted">
                    设置时间组包含的{{
                    GRANULARITY_MAP[currentTimeGroup.granularity]
                  }}数（最大1000）
                </p>
            </div>

            <!-- 开始时间设置 -->
          <div
              v-if="computedProps.showStartTimeSettings.value"
              class="space-y-3"
          >
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-normal"
                        >开始时间</label
                    >
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-normal">继承父组件</span>
                        <TcSwitch
                            :model-value="
                                computedProps.isInheritStartTime.value
                            "
                            @update:model-value="
                                updateTimeGroup.startTimeInherit
                            "
                        />
                    </div>
                </div>
                <TcInput
                    v-if="!computedProps.isInheritStartTime.value"
                    type="date"
                    :model-value="computedProps.formattedStartTime.value"
                    @update:model-value="updateTimeGroup.startTime"
                    class="w-full"
                />
            <p v-else class="text-sm text-muted italic">
                    将继承父时间组的开始时间
                </p>
            </div>
        </div>

        <div
            v-else
            class="h-full flex items-center justify-center text-muted"
        >
            请选择一个时间组进行编辑
        </div>
    </div>
</template>

<style scoped>
.form-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm;
  @apply focus:ring-2 focus:ring-primary focus:border-primary;
    padding-right: 2.5rem;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5em 1.5em;
    appearance: none;
}

.form-select:focus {
    outline: none;
}
</style>
