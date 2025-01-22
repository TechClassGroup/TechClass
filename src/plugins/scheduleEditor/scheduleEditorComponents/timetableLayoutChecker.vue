<script setup lang="ts">
import { computed } from "vue";
import { TimetableObject } from "@/plugins/scheduleEditor/scheduleEditorTypes";
import { DateTime } from "luxon";
import { scheduleEditorState } from "@/plugins/scheduleEditor/scheduleEditor";

const selectedTimetableId = defineModel<string>("selectedTimetableId", {
    required: true,
});
const selectedLayoutId = defineModel<string>("selectedLayoutId", {
    required: true,
});
const timetables = defineModel<TimetableObject>("timetables", {
    required: true,
});

const subjects = scheduleEditorState.value.subjects;

const currentLayout = computed(() => {
    if (
        !selectedTimetableId.value ||
        !selectedLayoutId.value ||
        !timetables.value[selectedTimetableId.value]?.layouts[
            selectedLayoutId.value
        ]
    ) {
        return null;
    }
    return timetables.value[selectedTimetableId.value].layouts[
        selectedLayoutId.value
    ];
});

function updateTime(field: "startTime" | "endTime", timeStr: string) {
    if (!currentLayout.value) return;

    // 验证时间格式
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        // 如果时间无效，恢复到当前值
        return;
    }

    const newTime = DateTime.now().set({ hour: hours, minute: minutes });

    if (field === "startTime") {
        currentLayout.value.startTime = newTime;
        if (newTime >= currentLayout.value.endTime) {
            currentLayout.value.endTime = newTime;
        }
    } else {
        currentLayout.value.endTime = newTime;
        if (newTime <= currentLayout.value.startTime) {
            currentLayout.value.endTime = currentLayout.value.startTime;
        }
    }
}

function updateType(type: "lesson" | "break") {
    if (!currentLayout.value) return;

    if (type === "lesson") {
        Object.assign(currentLayout.value, {
            type: "lesson",
            subjectId: "",
        });
        // @ts-ignore
        delete currentLayout.value.breakName;
    } else {
        Object.assign(currentLayout.value, {
            type: "break",
            breakName: "休息时间",
        });
        // @ts-ignore
        delete currentLayout.value.subjectId;
    }
}

function updateBreakName(name: string) {
    if (!currentLayout.value || currentLayout.value.type !== "break") return;
    currentLayout.value.breakName = name;
}

function updateSubject(subjectId: string) {
    if (!currentLayout.value || currentLayout.value.type !== "lesson") return;
    currentLayout.value.subjectId = subjectId;
}

function formatTimeForInput(time: DateTime): string {
    return time.toFormat("HH:mm");
}
</script>

<template>
    <div class="p-4 flex flex-col gap-6" v-if="currentLayout">
        <!-- 时间设置 -->
        <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">时间设置</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                        >开始时间</label
                    >
                    <input
                        type="time"
                        :value="formatTimeForInput(currentLayout.startTime)"
                        @input="(e) => updateTime('startTime', (e.target as HTMLInputElement).value)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="00:00"
                        max="23:59"
                        step="60"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                        >结束时间</label
                    >
                    <input
                        type="time"
                        :value="formatTimeForInput(currentLayout.endTime)"
                        @input="(e) => updateTime('endTime', (e.target as HTMLInputElement).value)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="00:00"
                        max="23:59"
                        step="60"
                    />
                </div>
            </div>
        </div>

        <!-- 类型选择 -->
        <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">类型设置</h3>
            <div class="flex gap-4">
                <button
                    class="flex-1 px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors"
                    :class="
                        currentLayout.type === 'lesson'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    "
                    @click="updateType('lesson')"
                >
                    课程
                </button>
                <button
                    class="flex-1 px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors"
                    :class="
                        currentLayout.type === 'break'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    "
                    @click="updateType('break')"
                >
                    休息
                </button>
            </div>
        </div>

        <!-- 课程/休息时间设置 -->
        <div class="space-y-4" v-if="currentLayout.type === 'lesson'">
            <h3 class="text-lg font-medium text-gray-900">课程设置</h3>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >选择课程</label
                >
                <select
                    :value="currentLayout.subjectId"
                    @change="(e) => updateSubject((e.target as HTMLSelectElement).value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">请选择课程</option>
                    <option
                        v-for="(subject, id) in subjects"
                        :key="id"
                        :value="id"
                    >
                        {{ subject.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="space-y-4" v-else>
            <h3 class="text-lg font-medium text-gray-900">休息时间设置</h3>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >休息时间名称</label
                >
                <input
                    type="text"
                    :value="currentLayout.breakName"
                    @input="(e) => updateBreakName((e.target as HTMLInputElement).value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：课间休息"
                />
            </div>
        </div>
    </div>

    <div v-else class="p-4 text-center text-gray-500">
        请选择一个课程进行编辑
    </div>
</template>

<style scoped>
input[type="time"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(0.5);
}
</style>
