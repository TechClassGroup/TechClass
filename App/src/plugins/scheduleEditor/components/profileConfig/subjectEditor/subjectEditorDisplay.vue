<script lang="ts" setup>
import {SubjectObject} from "../../../scheduleEditorTypes";

defineProps<{
    subjects: SubjectObject;
    selectedSubjectId: string;
}>();

defineEmits<{
    (e: "select", id: string): void;
}>();
</script>

<template>
    <div class="flex flex-col gap-2 p-2 bg-gray-50 rounded-lg">
        <TransitionGroup class="flex flex-col gap-2" name="list" tag="div">
            <div
                v-for="(subject, id) in subjects"
                :key="id"
                :class="[
                    selectedSubjectId === id
                        ? 'bg-[#0078D4]/10 text-[#0078D4] shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
                ]"
                class="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                @click="$emit('select', String(id))"
            >
                <div class="flex flex-col gap-1">
                    <div class="flex items-center">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">{{ subject.name }}</span>
                            <span
                                v-if="subject.shortName"
                                class="text-sm opacity-60"
                                >({{ subject.shortName }})</span
                            >
                        </div>

                    </div>
                    <div
                        v-if="subject.notes"
                        class="text-xs text-gray-500 pl-0.5"
                    >
                        {{ subject.notes }}
                    </div>
                </div>
            </div>
        </TransitionGroup>
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
</style>
