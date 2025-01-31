<script setup lang="ts">
import {computed} from "vue";
import {TimetableObject} from "../../../scheduleEditorTypes";
import {v4 as uuidv4} from "uuid";
import {DateTime, Duration} from "luxon";
import TcButton from "../../../../../UI/TcButton.vue";

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

const sortedLayouts = computed(() => {
  const layouts = {...currentLayouts.value};
  return Object.entries(layouts)
      .sort(([, a], [, b]) => {
        return a.startTime.toMillis() - b.startTime.toMillis();
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as typeof layouts);
});

function formatTime(time: DateTime): string {
  return time.toFormat("HH:mm:ss");
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
  const startTime = now.set({
    hour: 8,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const endTime = now.set({hour: 8, minute: 45, second: 0, millisecond: 0});

  currentLayouts.value[newId] = {
    type: "lesson",
    startTime: startTime,
    endTime: endTime,
    subjectId: "",
    hide: false,
  };
  selectedLayoutId.value = newId;
}

function copyLayout(id: string | number) {
  if (!selectedTimetableId.value || !currentLayouts.value[id]) return;

  const newId = generateUniqueId();
  const original = currentLayouts.value[id];
  currentLayouts.value[newId] = {
    ...original,
    startTime: original.startTime.set({millisecond: 0}),
    endTime: original.endTime.set({millisecond: 0}),
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
          :disabled="!selectedTimetableId"
          class="flex-1"
          variant="filled"
          @click="addLayout"
      >
        添加
      </TcButton>
      <TcButton
          :disabled="!selectedLayoutId"
          class="flex-1"
          variant="tonal"
          @click="copyLayout(selectedLayoutId)"
      >
        复制
      </TcButton>
      <TcButton
          :disabled="!selectedLayoutId"
          class="flex-1"
          color="error"
          variant="tonal"
          @click="deleteLayout(selectedLayoutId)"
      >
        删除
      </TcButton>
    </div>

    <!-- 课程列表 -->
    <div class="flex-1 overflow-y-auto scrollbar-stable bg-gray-50">
      <div class="flex flex-col gap-2 p-2 rounded-lg h-full">
        <TransitionGroup
            class="flex flex-col gap-2"
            name="list"
            tag="div"
        >
          <div
              v-for="(layout, id) in sortedLayouts"
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
              <div class="flex items-center justify-between">
                                <span class="font-medium">
                                    {{ formatTime(layout.startTime) }} -
                                    {{ formatTime(layout.endTime) }}
                                </span>
                <span
                    :class="[
                                        'text-xs px-1.5 py-0.5 rounded',
                                        layout.type === 'lesson'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-green-100 text-green-700',
                                    ]"
                >
                                    {{
                    layout.type === "lesson"
                        ? "课程"
                        : "课间"
                  }}
                                </span>
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
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
