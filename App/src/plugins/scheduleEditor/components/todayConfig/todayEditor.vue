<script lang="ts" setup>
import {computed, ref} from "vue";
import {scheduleEditorTodayConfig} from "../../store/todayConfigStore";
import TcInput from "../../../../UI/TcInput.vue";

const selectedScheduleIndex = ref<number>(-1);

const sortedSchedule = computed(() => {
  return [...(scheduleEditorTodayConfig.value.schedule || [])].sort(
      (a, b) => a.startTime.toMillis() - b.startTime.toMillis()
  );
});

function handleUpdate(field: string, value: string) {
  if (selectedScheduleIndex.value >= 0) {
    const schedule =
        scheduleEditorTodayConfig.value.schedule[
            selectedScheduleIndex.value
            ];
    if (schedule) {
      if (field === "startTime" || field === "endTime") {
        const [hours, minutes] = value.split(":").map(Number);
        const currentTime = schedule[field];
        // 保持年月日不变，只修改时分
        schedule[field] = currentTime.set({
          hour: hours || currentTime.hour,
          minute: minutes || currentTime.minute,
          second: 0, // 重置秒数
          millisecond: 0, // 重置毫秒
        });
      } else {
        schedule[field] = value;
      }
    }
  }
}
</script>

<template>
  <div class="flex gap-4 h-[100%]">
    <!-- 左侧面板 -->
    <div class="flex-1 max-w-60 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">课程列表</h2>
      </div>
      <div class="flex-1 bg-white rounded-lg shadow-sm overflow-y-auto">
        <div class="p-2 flex flex-col gap-2">
          <TransitionGroup
              class="flex flex-col gap-2"
              name="list"
              tag="div"
          >
            <button
                v-for="(item, index) in sortedSchedule"
                :key="index"
                :class="[
                                selectedScheduleIndex === index
                                    ? 'bg-[#0078D4]/10 text-[#0078D4] shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
                            ]"
                class="text-left px-4 py-3 rounded-lg transition-all duration-200 select-none"
                @click="selectedScheduleIndex = index"
            >
              <div class="flex flex-col gap-1">
                <div class="flex items-center">
                  <div class="flex items-center gap-2">
                                        <span class="font-medium">{{
                                            item.name
                                          }}</span>
                    <span
                        v-if="item.shortName"
                        class="text-sm opacity-60"
                    >({{ item.shortName }})</span
                    >
                  </div>
                </div>
                <div class="text-xs text-gray-500 pl-0.5">
                  {{ item.startTime.toFormat("HH:mm") }} -
                  {{ item.endTime.toFormat("HH:mm") }}
                </div>
              </div>
            </button>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">课程详情</h2>
      </div>
      <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm">
        <div v-if="selectedScheduleIndex >= 0" class="p-6">
          <div class="text-2xl font-medium text-gray-800">
            {{ sortedSchedule[selectedScheduleIndex].name }}
            <span
                v-if="
                                sortedSchedule[selectedScheduleIndex].shortName
                            "
                class="text-sm text-gray-500 ml-2"
            >({{
                sortedSchedule[selectedScheduleIndex].shortName
              }})</span
            >
          </div>

          <div class="space-y-4 mt-6">
            <div class="space-y-2">
              <label class="text-sm text-gray-600"
              >课程名称</label
              >
              <TcInput
                  :model-value="
                                    sortedSchedule[selectedScheduleIndex].name
                                "
                  placeholder="请输入课程名称"
                  @update:model-value="
                                    (v) => handleUpdate('name', v)
                                "
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm text-gray-600">简称</label>
              <TcInput
                  :model-value="
                                    sortedSchedule[selectedScheduleIndex]
                                        .shortName
                                "
                  placeholder="请输入课程简称"
                  @update:model-value="
                                    (v) => handleUpdate('shortName', v)
                                "
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm text-gray-600"
              >教师姓名</label
              >
              <TcInput
                  :model-value="
                                    sortedSchedule[selectedScheduleIndex]
                                        .teacherName
                                "
                  placeholder="请输入教师姓名"
                  @update:model-value="
                                    (v) => handleUpdate('teacherName', v)
                                "
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm text-gray-600"
              >开始时间</label
              >
              <input
                  :value="
                                    sortedSchedule[
                                        selectedScheduleIndex
                                    ].startTime.toFormat('HH:mm')
                                "
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                  type="time"
                  @change="(e) => handleUpdate('startTime', (e.target as HTMLInputElement).value)"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm text-gray-600"
              >结束时间</label
              >
              <input
                  :value="
                                    sortedSchedule[
                                        selectedScheduleIndex
                                    ].endTime.toFormat('HH:mm')
                                "
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                  type="time"
                  @change="(e) => handleUpdate('endTime', (e.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-gray-500 text-center">
          请选择左侧课程
        </div>
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

input[type="time"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}
</style>
