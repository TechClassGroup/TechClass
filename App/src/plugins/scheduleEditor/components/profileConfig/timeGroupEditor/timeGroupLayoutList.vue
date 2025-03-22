<script setup lang="ts">
import {computed} from "vue";
import {timeGroupObject} from "../../../scheduleEditor.types";

import {scheduleEditorProfile} from "../../../store/scheduleEditorProfile";

const selectedTimeGroupId = defineModel<string>("selectedTimeGroupId", {
    required: true,
});
const selectedLayoutIndex = defineModel<number>("selectedLayoutIndex", {
    required: true,
});
const timeGroups = defineModel<timeGroupObject>("timeGroups", {
    required: true,
});

const curriculums = scheduleEditorProfile.value.curriculums;

const currentTimeGroup = computed(() => {
    if (
        !selectedTimeGroupId.value ||
        !timeGroups.value[selectedTimeGroupId.value]
    ) {
        return null;
    }
    return timeGroups.value[selectedTimeGroupId.value];
});

// 添加粒度映射
const granularityMap = {
    day: "天",
    week: "周",
    month: "月",
    year: "年",
} as const;

function getGranularityName(granularity: keyof typeof granularityMap) {
    return granularityMap[granularity] || "未知";
}

function getLayoutName(layout: { type: string; id: string }) {
    if (layout.type === "curriculum") {
        return curriculums[layout.id]?.name || "未选择课表";
    } else {
        return timeGroups.value[layout.id]?.name || "未选择时间组";
    }
}

function getLayoutTypeName(type: string) {
    return type === "curriculum" ? "课表" : "时间组";
}

const weekDayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function getCycleName(index: number) {
    if (!currentTimeGroup.value) return "";

  // 如果是天粒度，根据预设类型显示
  if (currentTimeGroup.value.granularity === "day") {
    switch (currentTimeGroup.value.dayCycleGranularity) {
      case "week":
        return weekDayNames[index];
      case "month":
        return `${index + 1}号`;
      case "custom":
        return `第 ${index + 1} 天`;
    }
  }

    const granularityName = getGranularityName(
        currentTimeGroup.value.granularity
    );
    return `第 ${index + 1} ${granularityName}`;
}

function updateLayoutType(index: number, type: "curriculum" | "timegroup") {
    if (!currentTimeGroup.value) return;
    currentTimeGroup.value.layout[index] = {
        type,
        id: "",
    };
}

function updateLayoutId(index: number, id: string) {
    if (!currentTimeGroup.value) return;
    currentTimeGroup.value.layout[index].id = id;
}

const availableTimeGroups = computed(() => {
    const result = { ...timeGroups.value };
    if (selectedTimeGroupId.value) {
        delete result[selectedTimeGroupId.value];
    }
    return result;
});
</script>

<template>
  <div class="flex flex-col h-full bg-100">
        <div class="flex-1 overflow-y-auto scrollbar-stable p-4">
            <div class="flex flex-col gap-4">
                <TransitionGroup
                    class="flex flex-col gap-4"
                    name="list"
                    tag="div"
                >
                    <div
                        v-for="(layout, index) in currentTimeGroup?.layout ||
                        []"
                        :key="index"
                        class="bg-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                        <!-- 标题栏 -->
                        <div
                            class="px-4 py-3 bg-100 border-b border-gray-200 flex items-center justify-between"
                        >
                          <div class="font-medium text-normal">
                                {{ getCycleName(index) }}
                            </div>
                            <span
                                class="text-xs px-2 py-0.5 rounded-full"
                                :class="[
                                    layout.type === 'curriculum'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-green-100 text-green-800',
                                ]"
                            >
                                {{ getLayoutTypeName(layout.type) }}
                            </span>
                        </div>

                        <!-- 内容区 -->
                      <div class="p-4 space-y-4 bg-50">
                            <!-- 类型选择 -->
                            <div>
                                <label
                                    class="block text-sm font-medium text-normal mb-1"
                                    >类型</label
                                >
                                <select
                                    :value="layout.type"
                                    @change="(e: Event) => updateLayoutType(index, ((e.target as HTMLSelectElement).value) as 'curriculum' | 'timegroup')"
                                    class="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-100"
                                >
                                    <option value="curriculum">课表</option>
                                    <option value="timegroup">时间组</option>
                                </select>
                            </div>

                            <!-- ID选择 -->
                            <div>
                                <label
                                    class="block text-sm font-medium text-normal mb-1"
                                >
                                    {{
                                        layout.type === "curriculum"
                                            ? "选择课表"
                                            : "选择时间组"
                                    }}
                                </label>
                                <select
                                    :value="layout.id"
                                    @change="
                                        (e: Event) =>
                                            updateLayoutId(
                                                index,
                                                (e.target as HTMLSelectElement).value
                                            )
                                    "
                                    class="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-100"
                                >
                                    <option value="">请选择</option>
                                    <template
                                        v-if="layout.type === 'curriculum'"
                                    >
                                        <option
                                            v-for="(
                                                curriculum, id
                                            ) in curriculums"
                                            :key="id"
                                            :value="id"
                                        >
                                            {{ curriculum.name }}
                                        </option>
                                    </template>
                                    <template v-else>
                                        <option
                                            v-for="(
                                                timeGroup, id
                                            ) in availableTimeGroups"
                                            :key="id"
                                            :value="id"
                                        >
                                            {{ timeGroup.name }}
                                        </option>
                                    </template>
                                </select>
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

select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

select:focus {
    outline: none;
}
</style>
