<script setup lang="ts">
import {computed} from "vue";
import {v4 as uuidv4} from "uuid";
import TcButton from "../../../../../UI/TcButton.vue";
import {scheduleEditorProfile} from "../../../store/scheduleEditorProfile";

const selectedCurriculumId = defineModel<string>("selectedCurriculumId", {
    required: true,
});

const curriculums = computed(() => scheduleEditorProfile.value.curriculums);

function generateUniqueId(): string {
    let newId = uuidv4();
    while (newId in curriculums.value) {
        newId = uuidv4();
    }
    return newId;
}

function addCurriculum() {
    const newId = generateUniqueId();
    curriculums.value[newId] = {
        name: "新课程表",
        timetableId: "",
        classes: [],
    };
    selectedCurriculumId.value = newId;
}

function copyCurriculum(id: string) {
    if (curriculums.value[id]) {
        const newId = generateUniqueId();
        curriculums.value[newId] = {
            ...curriculums.value[id],
            name: `${curriculums.value[id].name} (副本)`,
        };
        selectedCurriculumId.value = newId;
    }
}

function deleteCurriculum(id: string) {
    if (curriculums.value[id]) {
        delete curriculums.value[id];
        if (selectedCurriculumId.value === id) {
            selectedCurriculumId.value = "";
        }
    }
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- 操作按钮 -->
        <div class="p-2 flex gap-2 border-b border-gray-200">
            <TcButton class="flex-1" variant="filled" @click="addCurriculum">
                添加
            </TcButton>
            <TcButton
                class="flex-1"
                variant="tonal"
                :disabled="!selectedCurriculumId"
                @click="copyCurriculum(String(selectedCurriculumId))"
            >
                复制
            </TcButton>
            <TcButton
                class="flex-1"
                variant="tonal"
                color="error"
                :disabled="!selectedCurriculumId"
                @click="deleteCurriculum(String(selectedCurriculumId))"
            >
                删除
            </TcButton>
        </div>

        <!-- 课程表列表 -->
        <div class="flex-1 overflow-y-auto scrollbar-stable bg-gray-50">
            <div class="flex flex-col gap-2 p-2  rounded-lg h-full">
                <TransitionGroup
                    class="flex flex-col gap-2"
                    name="list"
                    tag="div"
                >
                    <div
                        v-for="(curriculum, id) in curriculums"
                        :key="id"
                        :class="[
                            selectedCurriculumId === id
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
                        ]"
                        class="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                        @click="selectedCurriculumId = String(id)"
                    >
                        <div class="flex flex-col gap-1">
                            <div class="flex items-center">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="font-medium break-all whitespace-normal"
                                    >
                                        {{ curriculum.name }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-xs text-gray-500 pl-0.5">
                                {{ curriculum.classes.length }} 个课程
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
