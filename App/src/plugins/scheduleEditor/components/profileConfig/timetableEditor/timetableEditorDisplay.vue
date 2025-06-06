<script lang="ts" setup>
import {TimetableObject} from "../../../scheduleEditor.types";
import {v4 as uuidv4} from "uuid";
import TcButton from "../../../../../UI/TcButton.vue";

const selectedTimetableId = defineModel<string | number>(
    "selectedTimetableId",
    {
      required: true,
    }
);
const timetables = defineModel<TimetableObject>("timetables", {
  required: true,
});

function generateUniqueId(): string {
  let newId = uuidv4();
  while (newId in timetables.value) {
    newId = uuidv4();
  }
  return newId;
}

function addTimetable() {
  const newId = generateUniqueId();
  timetables.value[newId] = {
    name: "新时间表",
    layouts: {},
  };
  selectedTimetableId.value = newId;
}

function copyTimetable(id: string | number) {
  if (timetables.value[id]) {
    const newId = generateUniqueId();
    timetables.value[newId] = {
      ...timetables.value[id],
      name: `${timetables.value[id].name} (副本)`,
    };
    selectedTimetableId.value = newId;
  }
}

function deleteTimetable(id: string | number) {
  if (timetables.value[id]) {
    delete timetables.value[id];
    if (selectedTimetableId.value === id) {
      selectedTimetableId.value = "";
    }
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 操作按钮 -->
    <div class="p-2 flex gap-2 border-b border-gray-200">
      <TcButton class="flex-1" variant="filled" @click="addTimetable">
        添加
      </TcButton>
      <TcButton
          :disabled="!selectedTimetableId"
          class="flex-1"
          variant="tonal"
          @click="copyTimetable(selectedTimetableId)"
      >
        复制
      </TcButton>
      <TcButton
          :disabled="!selectedTimetableId"
          class="flex-1"
          color="error"
          variant="tonal"
          @click="deleteTimetable(selectedTimetableId)"
      >
        删除
      </TcButton>
    </div>

    <!-- 时间表列表 -->
    <div class="flex-1 overflow-y-auto scrollbar-stable bg-100">
      <div class="flex flex-col gap-2 p-2  rounded-lg h-full">
        <TransitionGroup
            class="flex flex-col gap-2"
            name="list"
            tag="div"
        >
          <div
              v-for="(timetable, id) in timetables"
              :key="id"
              :class="[
                            selectedTimetableId === id
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-normal hover:bg-500 hover:translate-x-1',
                        ]"
              class="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
              @click="selectedTimetableId = id"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center">
                <div class="flex items-center gap-2">
                                    <span
                                        class="font-medium break-all whitespace-normal"
                                    >{{ timetable.name }}</span
                                    >
                </div>
              </div>
              <div class="text-xs text-muted pl-0.5">
                {{ Object.keys(timetable.layouts).length }}
                个时间段
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
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
