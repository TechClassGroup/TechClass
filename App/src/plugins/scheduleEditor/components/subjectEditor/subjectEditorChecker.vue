<script lang="ts" setup>
import {SubjectObject} from "../../scheduleEditorTypes.ts";
import TcInput from "../../../../UI/TcInput.vue";

const props = defineProps<{
  subject?: SubjectObject[string];
  subjectId?: string;
}>();

const emit = defineEmits<{
  (
      e: "update",
      id: string,
      field: keyof SubjectObject[string],
      value: string | boolean
  ): void;
}>();

function handleUpdate(
    field: keyof SubjectObject[string],
    value: string | boolean
) {
  if (props.subjectId && props.subject) {
    emit("update", props.subjectId, field, value);
  }
}
</script>

<template>
  <div class="p-6 h-full">
    <div v-if="subject && subjectId" class="space-y-6">
      <div class="text-2xl font-medium text-gray-800">
        {{ subject.name }}
        <span
            v-if="subject.shortName"
            class="text-sm text-gray-500 ml-2"
        >({{ subject.shortName }})</span
        >
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm text-gray-600">科目名称</label>
          <TcInput
              :model-value="subject.name"
              placeholder="请输入科目名称"
              @update:model-value="(v) => handleUpdate('name', v)"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm text-gray-600">简称</label>
          <TcInput
              :model-value="subject.shortName"
              placeholder="请输入科目简称"
              @update:model-value="
                            (v) => handleUpdate('shortName', v)
                        "
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm text-gray-600">教师姓名</label>
          <TcInput
              :model-value="subject.teacherName"
              placeholder="请输入教师姓名"
              @update:model-value="
                            (v) => handleUpdate('teacherName', v)
                        "
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm text-gray-600">备注</label>
          <TcInput
              :model-value="subject.notes"
              placeholder="请输入备注信息"
              @update:model-value="(v) => handleUpdate('notes', v)"
          />
        </div>


      </div>
    </div>

    <div
        v-else
        class="h-full flex items-center justify-center text-gray-400"
    >
      请选择一个科目以查看详细信息
    </div>
  </div>
</template>

<style scoped></style>
