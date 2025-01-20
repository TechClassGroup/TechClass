<script setup lang="ts">
import { Ref, ref } from "vue";
import { SubjectObject } from "@/plugins/scheduleEditor/scheduleEditorTypes.ts";

const subjects: Ref<SubjectObject> = ref({
    "550e8400-e29b-41d4-a716-446655440000": {
        name: "数学",
        shortName: "数",
        notes: "数学喵",
        teacherName: "",
        isActive: true,

    },
});
</script>

<template>
    <div>
        {{ subjects }}
    </div>
</template>

<style scoped></style>
