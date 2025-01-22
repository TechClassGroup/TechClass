<script setup lang="ts">
import { computed } from "vue";
import { TimetableObject } from "@/plugins/scheduleEditor/scheduleEditorTypes";
import { v4 as uuidv4 } from "uuid";
import { DateTime, Duration } from "luxon";
import TcButton from "@/UI/TcButton.vue";

const selectedTimetableId = defineModel<string | number>(
    "selectedTimetableId",
    {
        required: true,
    }
);
const selectedLayoutId = defineModel<string | number>("selectedLayoutId", {
    required: true,
});
const timetables = defineModel<TimetableObject>("timetables", {
    required: true,
});

const currentLayouts = computed(() => {
    if (
        !selectedTimetableId.value ||
        !timetables.value[selectedTimetableId.value]
    ) {
        return {};
    }
    return timetables.value[selectedTimetableId.value].layouts;
});

function formatTime(time: DateTime): string {
    return time.toFormat("HH:mm");
}

function calculateDuration(start: DateTime, end: DateTime): string {
    const duration = Duration.fromMillis(end.diff(start).milliseconds);
    const hours = Math.floor(duration.as("hours"));
    const minutes = Math.floor(duration.as("minutes") % 60);
    const seconds = Math.floor(duration.as("seconds") % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function generateUniqueId(): string {
    let newId = uuidv4();
    while (newId in currentLayouts.value) {
        newId = uuidv4();
    }
    return newId;
}

function addLayout() {
    if (!selectedTimetableId.value) return;

    const newId = generateUniqueId();
    const now = DateTime.now();
    currentLayouts.value[newId] = {
        type: "lesson",
        startTime: now.set({ hour: 8, minute: 0 }),
        endTime: now.set({ hour: 8, minute: 45 }),
        subjectId: "",
    };
    selectedLayoutId.value = newId;
}

function copyLayout(id: string | number) {
    if (!selectedTimetableId.value || !currentLayouts.value[id]) return;

    const newId = generateUniqueId();
    currentLayouts.value[newId] = {
        ...currentLayouts.value[id],
    };
    selectedLayoutId.value = newId;
}

function deleteLayout(id: string | number) {
    if (!selectedTimetableId.value || !currentLayouts.value[id]) return;

    delete currentLayouts.value[id];
    if (selectedLayoutId.value === id) {
        selectedLayoutId.value = "";
    }
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- 操作按钮 -->
        <div class="p-2 flex gap-2 border-b border-gray-200">
            <TcButton
                class="flex-1"
                variant="filled"
                :disabled="!selectedTimetableId"
                @click="addLayout"
            >
                添加
            </TcButton>
            <TcButton
                class="flex-1"
                variant="tonal"
                :disabled="!selectedLayoutId"
                @click="copyLayout(selectedLayoutId)"
            >
                复制
            </TcButton>
            <TcButton
                class="flex-1"
                variant="outlined"
                :disabled="!selectedLayoutId"
                @click="deleteLayout(selectedLayoutId)"
            >
                删除
            </TcButton>
        </div>

        <!-- 课程列表 -->
        <div class="flex-1 overflow-y-auto scrollbar-stable">
            <div
                v-for="(layout, id) in currentLayouts"
                :key="id"
                class="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 relative"
                :class="{ 'bg-blue-50': id === selectedLayoutId }"
                @click="selectedLayoutId = id"
            >
                <div class="flex items-center gap-2">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">
                            {{ formatTime(layout.startTime) }} -
                            {{ formatTime(layout.endTime) }}
                        </div>
                        <div class="text-sm text-gray-500 mt-1">
                            持续时间:
                            {{
                                calculateDuration(
                                    layout.startTime,
                                    layout.endTime
                                )
                            }}
                        </div>
                    </div>
                </div>
                <div
                    v-if="id === selectedLayoutId"
                    class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
