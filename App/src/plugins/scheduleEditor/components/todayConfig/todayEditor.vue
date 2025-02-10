<script lang="ts" setup>
import {computed, ref} from "vue";
import {scheduleEditorTodayConfig} from "../../store/todayConfigStore";
import {scheduleEditorProfile} from "../../store/scheduleEditorProfile";
import TcInput from "../../../../UI/TcInput.vue";
import TcSwitch from "../../../../UI/TcSwitch.vue";
import TcButton from "../../../../UI/TcButton.vue";

const selectedScheduleIndex = ref<number>(-1);
const showSubjectSelector = ref(false);

const sortedSchedule = computed(() => {
  return [...(scheduleEditorTodayConfig.value.schedule || [])].sort(
      (a, b) => a.startTime.toMillis() - b.startTime.toMillis()
  );
});

const subjects = computed(() => scheduleEditorProfile.value.subjects);

function handleUpdate(field: string, value: string | boolean) {
  if (selectedScheduleIndex.value >= 0) {
    const schedule =
        scheduleEditorTodayConfig.value.schedule[
            selectedScheduleIndex.value
            ];
    if (schedule) {
      if (field === "startTime" || field === "endTime") {
        const [hours, minutes] = (value as string)
            .split(":")
            .map(Number);
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

function handleSubjectSelect(subjectId: string) {
  if (selectedScheduleIndex.value >= 0 && subjectId) {
    const subject = subjects.value[subjectId];
    if (subject) {
      handleUpdate("name", subject.name);
      handleUpdate("shortName", subject.shortName);
      handleUpdate("teacherName", subject.teacherName);
      showSubjectSelector.value = false;
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
            <!-- 科目选择器 -->
            <div class="relative">
              <TcButton
                  class="w-full"
                  variant="tonal"
                  @click="
                                    showSubjectSelector = !showSubjectSelector
                                "
              >
                修改为其他科目
              </TcButton>

              <!-- 弹出菜单 -->
              <div
                  v-if="showSubjectSelector"
                  v-click-outside="
                                    () => (showSubjectSelector = false)
                                "
                  class="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
              >
                <div class="p-1">
                  <button
                      v-for="(subject, id) in subjects"
                      :key="id"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      @click="handleSubjectSelect(String(id))"
                  >
                    <div class="font-medium">
                      {{ subject.name }}
                    </div>
                    <div
                        v-if="subject.shortName"
                        class="text-sm text-gray-500"
                    >
                      ({{ subject.shortName }})
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div class="h-px bg-gray-200 my-4"></div>

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

            <div class="h-px bg-gray-200 my-4"></div>

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

            <div class="h-px bg-gray-200 my-4"></div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm text-gray-600"
                >单独显示</label
                >
                <TcSwitch
                    :model-value="
                                        sortedSchedule[selectedScheduleIndex]
                                            .noDisplayedSeparately
                                    "
                    @update:model-value="
                                        (v) =>
                                            handleUpdate(
                                                'noDisplayedSeparately',
                                                v
                                            )
                                    "
                />
              </div>
              <div class="text-xs text-gray-500">
                启用后，该课程将在单独的位置显示
              </div>
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
