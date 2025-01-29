<script setup lang="ts">
import { computed } from "vue";
import { timeGroupObject } from "../../scheduleEditorTypes";
import TcInput from "../../../../UI/TcInput.vue";
import TcSwitch from "../../../../UI/TcSwitch.vue";
import { DateTime } from "luxon";

const selectedTimeGroupId = defineModel<string>("selectedTimeGroupId", {
    required: true,
});
const timeGroups = defineModel<timeGroupObject>("timeGroups", {
    required: true,
});

const currentTimeGroup = computed(() => {
    if (
        !selectedTimeGroupId.value ||
        !timeGroups.value[selectedTimeGroupId.value]
    ) {
        return null;
    }
    return timeGroups.value[selectedTimeGroupId.value];
});

// 添加相同的粒度映射
const granularityMap = {
    day: "天",
    week: "周",
    month: "月",
    year: "年",
} as const;

function getGranularityName(granularity: keyof typeof granularityMap) {
    return granularityMap[granularity] || "未知";
}

function updateName(name: string) {
    if (!currentTimeGroup.value) return;
    currentTimeGroup.value.name = name;
}

function updateGranularity(granularity: "day" | "week" | "month" | "year") {
    if (!currentTimeGroup.value) return;
    currentTimeGroup.value.granularity = granularity;
}

function updateCycle(cycle: number) {
    if (!currentTimeGroup.value) return;
    // 确保周期至少为1
    const newCycle = Math.max(1, cycle);
    currentTimeGroup.value.cycle = newCycle;

    // 调整布局数组长度以匹配新的周期
    while (currentTimeGroup.value.layout.length > newCycle) {
        currentTimeGroup.value.layout.pop();
    }
    while (currentTimeGroup.value.layout.length < newCycle) {
        currentTimeGroup.value.layout.push({
            type: "curriculum",
            id: "",
        });
    }
}

function updateStartTime(dateStr: string) {
    if (!currentTimeGroup.value) return;
    const newDate = DateTime.fromISO(dateStr);
    if (newDate.isValid) {
        currentTimeGroup.value.startTime = newDate;
    }
}

function updateStartTimeInherit(inherit: boolean) {
    if (!currentTimeGroup.value) return;
    if (inherit) {
        currentTimeGroup.value.startTime = null;
    } else {
        // 设置为当前日期
        currentTimeGroup.value.startTime = DateTime.now().startOf("day");
    }
}

const isInheritStartTime = computed(() => {
    return currentTimeGroup.value?.startTime === null;
});

const formattedStartTime = computed(() => {
    if (!currentTimeGroup.value?.startTime)
        return DateTime.now().toFormat("yyyy-MM-dd");
    return currentTimeGroup.value.startTime.toFormat("yyyy-MM-dd");
});
</script>

<template>
    <div class="p-4">
        <div v-if="currentTimeGroup" class="space-y-6">
            <!-- 时间组名称 -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >时间组名称</label
                >
                <TcInput
                    :model-value="currentTimeGroup.name"
                    placeholder="请输入时间组名称"
                    @update:model-value="updateName"
                />
            </div>

            <!-- 粒度设置 -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >时间粒度</label
                >
                <select
                    :value="currentTimeGroup.granularity"
                    @change="(e) => updateGranularity(e.target.value as 'day' | 'week' | 'month' | 'year')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                >
                    <option
                        v-for="(name, value) in granularityMap"
                        :key="value"
                        :value="value"
                    >
                        {{ name }}
                    </option>
                </select>
            </div>

            <!-- 周期设置 -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >周期</label
                >
                <TcInput
                    type="number"
                    :model-value="String(currentTimeGroup.cycle)"
                    min="1"
                    @update:model-value="(value) => updateCycle(Number(value))"
                />
                <p class="mt-1 text-sm text-gray-500">
                    设置时间组包含的{{
                        getGranularityName(currentTimeGroup.granularity)
                    }}数
                </p>
            </div>

            <!-- 开始时间设置 -->
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-medium text-gray-700"
                        >开始时间</label
                    >
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600">继承父组件</span>
                        <TcSwitch
                            :model-value="isInheritStartTime"
                            @update:model-value="updateStartTimeInherit"
                        />
                    </div>
                </div>
                <TcInput
                    v-if="!isInheritStartTime"
                    type="date"
                    :model-value="formattedStartTime"
                    @update:model-value="updateStartTime"
                    class="w-full"
                />
                <p v-else class="text-sm text-gray-500 italic">
                    将继承父时间组的开始时间
                </p>
            </div>
        </div>

        <div
            v-else
            class="h-full flex items-center justify-center text-gray-500"
        >
            请选择一个时间组进行编辑
        </div>
    </div>
</template>

<style scoped>
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
