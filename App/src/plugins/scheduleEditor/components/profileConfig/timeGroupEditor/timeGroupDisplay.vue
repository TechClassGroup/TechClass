<script setup lang="ts">
import {timeGroupObject} from "../../../scheduleEditorTypes";
import {v4 as uuidv4} from "uuid";
import TcButton from "../../../../../UI/TcButton.vue";
import {DateTime} from "luxon";

const selectedTimeGroupId = defineModel<string>("selectedTimeGroupId", {
    required: true,
});
const timeGroups = defineModel<timeGroupObject>("timeGroups", {
    required: true,
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
        timeGroups.value[newId] = {
            ...timeGroups.value[id],
            name: `${timeGroups.value[id].name} (副本)`,
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
    const parts = [
        getGranularityName(timeGroup.granularity),
        `共 ${timeGroup.cycle} ${getGranularityName(timeGroup.granularity)}`,
    ];

    if (timeGroup.startTime) {
        parts.push(`${timeGroup.startTime.toFormat("yyyy-MM-dd")}`);
    } else {
        parts.push("继承开始时间");
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
                class="flex-1"
                variant="tonal"
                :disabled="!selectedTimeGroupId"
                @click="copyTimeGroup(selectedTimeGroupId)"
            >
                复制
            </TcButton>
            <TcButton
                class="flex-1"
                variant="tonal"
                :disabled="!selectedTimeGroupId"
                color="error"
                @click="deleteTimeGroup(selectedTimeGroupId)"
            >
                删除
            </TcButton>
        </div>

        <!-- 时间组列表 -->
        <div class="flex-1 overflow-y-auto scrollbar-stable bg-gray-50">
            <div class="flex flex-col gap-2 p-2  rounded-lg h-full">
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
                                ? 'bg-[#0078D4]/10 text-[#0078D4] shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
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
                            <div class="text-xs text-gray-500 pl-0.5">
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
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
