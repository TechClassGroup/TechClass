<script setup lang="ts">
import {computed} from "vue";
import {scheduleEditorProfile} from "../../scheduleStore";
import TcInput from "../../../../UI/TcInput.vue";

const selectedCurriculumId = defineModel<string>("selectedCurriculumId", {
    required: true,
});

const curriculums = computed(() => scheduleEditorProfile.value.curriculums);
const timetables = computed(() => scheduleEditorProfile.value.timetables);

const currentCurriculum = computed(() => {
    if (
        !selectedCurriculumId.value ||
        !curriculums.value[selectedCurriculumId.value]
    ) {
        return null;
    }
    return curriculums.value[selectedCurriculumId.value];
});

function updateCurriculumName(name: string) {
    if (!currentCurriculum.value) return;
    currentCurriculum.value.name = name;
}

function updateTimetable(timetableId: string) {
    if (!currentCurriculum.value) return;
    currentCurriculum.value.timetableId = timetableId;
    // 清空现有课程安排，因为时间表变了
    currentCurriculum.value.classes = [
        {
            timeId: "",
            subjectId: "",
        },
    ];
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- 未选择课程表时的提示 -->
        <div v-if="!currentCurriculum" class="text-center text-gray-500 p-4">
            请选择一个课程表
        </div>

        <template v-else>
            <!-- 基本信息 -->
            <div class="p-2 border-b border-gray-200">
                <h2 class="text-lg font-medium">基本信息</h2>
            </div>

            <div class="flex-1 overflow-y-auto scrollbar-stable">
                <div class="p-4 space-y-6">
                    <div class="space-y-2">
                        <label class="text-sm text-gray-600">课程表名称</label>
                        <TcInput
                            :model-value="currentCurriculum.name"
                            placeholder="请输入课程表名称"
                            @update:model-value="updateCurriculumName"
                        />
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm text-gray-600">选择时间表</label>
                        <select
                            :value="currentCurriculum.timetableId"
                            @change="
                                (e) =>
                                    updateTimetable(
                                        (e.target as HTMLSelectElement).value
                                    )
                            "
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                        >
                            <option value="">请选择时间表</option>
                            <option
                                v-for="(timetable, id) in timetables"
                                :key="id"
                                :value="id"
                            >
                                {{ timetable.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
