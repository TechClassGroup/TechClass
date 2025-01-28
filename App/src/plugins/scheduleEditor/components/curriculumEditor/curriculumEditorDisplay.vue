<script setup lang="ts">
import { computed } from "vue";
import { scheduleEditorState } from "../../scheduleStore";
import { DateTime } from "luxon";

const selectedCurriculumId = defineModel<string>("selectedCurriculumId", {
    required: true,
});

const curriculums = computed(() => scheduleEditorState.value.curriculums);
const timetables = computed(() => scheduleEditorState.value.timetables);
const subjects = computed(() => scheduleEditorState.value.subjects);

const currentCurriculum = computed(() => {
    if (
        !selectedCurriculumId.value ||
        !curriculums.value[selectedCurriculumId.value]
    ) {
        return null;
    }
    return curriculums.value[selectedCurriculumId.value];
});

const currentTimetable = computed(() => {
    if (!currentCurriculum.value || !currentCurriculum.value.timetableId) {
        return null;
    }
    return timetables.value[currentCurriculum.value.timetableId];
});

function formatTime(time: DateTime): string {
    return time.toFormat("HH:mm");
}

function getSubjectName(subjectId: string): string {
    return subjects.value[subjectId]?.name || "未指定";
}

function getLayoutName(layout: any): string {
    if (layout.type === "break") {
        return layout.breakName;
    } else {
        const subjectId = currentCurriculum.value?.classes.find(
            (c) => c.timeId === layout.id
        )?.subjectId;
        return subjectId ? getSubjectName(subjectId) : "未安排";
    }
}

function updateSubject(timeId: string, subjectId: string) {
    if (!currentCurriculum.value) return;

    const existingClass = currentCurriculum.value.classes.find(
        (c) => c.timeId === timeId
    );

    if (existingClass) {
        existingClass.subjectId = subjectId;
    } else {
        currentCurriculum.value.classes = [
            {
                timeId,
                subjectId,
            },
        ];
    }
}

function getClassSubjectId(timeId: string): string {
    if (!currentCurriculum.value) return "";
    return (
        currentCurriculum.value.classes.find((c) => c.timeId === timeId)
            ?.subjectId || ""
    );
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- 未选择课程表时的提示 -->
        <div v-if="!currentCurriculum" class="text-center text-gray-500 p-4">
            请选择一个课程表
        </div>

        <!-- 未选择时间表时的提示 -->
        <div
            v-else-if="!currentTimetable"
            class="text-center text-gray-500 p-4"
        >
            请先选择关联的时间表
        </div>

        <!-- 课程表内容 -->
        <template v-else>
            <!-- 标题信息 -->
            <div class="p-2 border-b border-gray-200">
                <h2 class="text-lg font-medium">
                    {{ currentCurriculum.name }}
                </h2>
                <p class="text-sm text-gray-500 mt-1">
                    使用时间表: {{ currentTimetable.name }}
                </p>
            </div>

            <!-- 课程安排列表 -->
            <div class="flex-1 overflow-y-auto scrollbar-stable">
                <div class="divide-y divide-gray-100">
                    <div
                        v-for="(layout, id) in currentTimetable.layouts"
                        :key="id"
                        class="p-4 hover:bg-gray-50"
                    >
                        <div class="flex items-center gap-4">
                            <!-- 时间显示 -->
                            <div class="text-sm font-medium text-gray-500 w-24">
                                {{ formatTime(layout.startTime) }} -
                                {{ formatTime(layout.endTime) }}
                            </div>

                            <!-- 课程时段 -->
                            <template v-if="layout.type === 'lesson'">
                                <div class="flex-1">
                                    <!-- 如果时间表定义了默认课程 -->
                                    <div
                                        v-if="layout.subjectId"
                                        class="flex flex-col gap-1"
                                    >
                                        <div class="text-sm text-gray-500">
                                            默认课程：{{
                                                getSubjectName(layout.subjectId)
                                            }}
                                        </div>
                                        <select
                                            :value="
                                                getClassSubjectId(String(id))
                                            "
                                            @change="(e) => updateSubject(String(id), (e.target as HTMLSelectElement).value)"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                                        >
                                            <option value="">
                                                继承默认课程
                                            </option>
                                            <option
                                                v-for="(
                                                    subject, subjectId
                                                ) in subjects"
                                                :key="subjectId"
                                                :value="subjectId"
                                            >
                                                {{ subject.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <!-- 如果时间表未定义默认课程 -->
                                    <div v-else>
                                        <select
                                            :value="
                                                getClassSubjectId(String(id))
                                            "
                                            @change="(e) => updateSubject(String(id), (e.target as HTMLSelectElement).value)"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                                        >
                                            <option value="">请选择课程</option>
                                            <option
                                                v-for="(
                                                    subject, subjectId
                                                ) in subjects"
                                                :key="subjectId"
                                                :value="subjectId"
                                            >
                                                {{ subject.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </template>

                            <!-- 课间时段 -->
                            <template v-else>
                                <div class="flex-1">
                                    <div class="text-sm text-gray-500">
                                        {{ layout.breakName }}
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
