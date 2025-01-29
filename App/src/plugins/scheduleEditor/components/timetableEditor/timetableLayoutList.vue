<script setup lang="ts">
import { computed } from "vue";
import { TimetableObject } from "../../scheduleEditorTypes";
import { v4 as uuidv4 } from "uuid";
import { DateTime, Duration } from "luxon";
import TcButton from "../../../../UI/TcButton.vue";

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
        hide: false,
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
                variant="tonal"
                color="error"
                :disabled="!selectedLayoutId"
                @click="deleteLayout(selectedLayoutId)"
            >
                删除
            </TcButton>
        </div>

        <!-- 课程列表 -->
        <div class="flex-1 overflow-y-auto scrollbar-stable bg-gray-50">
            <div class="flex flex-col gap-2 p-2  rounded-lg h-full">
                <TransitionGroup
                    class="flex flex-col gap-2"
                    name="list"
                    tag="div"
                >
                    <div
                        v-for="(layout, id) in currentLayouts"
                        :key="id"
                        :class="[
                            selectedLayoutId === id
                                ? 'bg-[#0078D4]/10 text-[#0078D4] shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
                        ]"
                        class="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                        @click="selectedLayoutId = id"
                    >
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">
                                        {{ formatTime(layout.startTime) }} -
                                        {{ formatTime(layout.endTime) }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-xs text-gray-500 pl-0.5">
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
