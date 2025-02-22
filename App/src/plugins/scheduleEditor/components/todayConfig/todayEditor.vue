<script lang="ts" setup>
import {computed, ref} from "vue";
import {scheduleEditorTodayConfig} from "../../store/todayConfigStore";
import {scheduleEditorProfile} from "../../store/scheduleEditorProfile";
import TcInput from "../../../../UI/TcInput.vue";
import TcSwitch from "../../../../UI/TcSwitch.vue";
import TcButton from "../../../../UI/TcButton.vue";
import {DateTime} from "luxon";
import {v4 as uuidv4} from "uuid";
import type {todaySchedule, todayScheduleBreak, todayScheduleLesson,} from "../../scheduleEditor.types";

const selectedScheduleId = ref<string>("");
const showSubjectSelector = ref(false);

const sortedSchedule = computed(() => {
  if (!scheduleEditorTodayConfig.value.schedule) {
    return [];
  }
  const scheduleEntries = Object.entries(
      scheduleEditorTodayConfig.value.schedule
  );
  return scheduleEntries.sort(
      ([_idA, a], [_idB, b]) =>
          a.startTime.toMillis() - b.startTime.toMillis()
  );
});

const subjects = computed(() => scheduleEditorProfile.value.subjects);

function handleUpdate(field: string, value: string | boolean) {
  if (
      selectedScheduleId.value &&
      scheduleEditorTodayConfig.value.schedule[selectedScheduleId.value]
  ) {
    const schedule =
        scheduleEditorTodayConfig.value.schedule[selectedScheduleId.value];
    if (field === "startTime" || field === "endTime") {
      const [hours, minutes] = (value as string).split(":").map(Number);
      const currentTime = schedule[field];
      // 保持年月日不变，只修改时分
      schedule[field] = currentTime.set({
        hour: hours || currentTime.hour,
        minute: minutes || currentTime.minute,
        second: 0, // 重置秒数
        millisecond: 0, // 重置毫秒
      });
    } else {
      (schedule as any)[field] = value;
    }
  }
}

function updateType(type: "lesson" | "break" | "dividingLine") {
  if (selectedScheduleId.value && type) {
    const now = DateTime.now();
    const baseSchedule = {
      startTime: now.set({
        hour: 8,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
    };

    let newSchedule: todaySchedule;

    if (type === "lesson") {
      newSchedule = {
        ...baseSchedule,
        type: "lesson",
        name: "新课程",
        shortName: "新",
        teacherName: "",
        noDisplayedSeparately: false,
        endTime: now.set({
          hour: 9,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      };
    } else if (type === "break") {
      newSchedule = {
        ...baseSchedule,
        type: "break",
        name: "课间休息",
        shortName: "休息",
        noDisplayedSeparately: false,
        endTime: now.set({
          hour: 9,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
      };
    } else {
      newSchedule = {
        ...baseSchedule,
        type: "dividingLine",
      };
    }

    scheduleEditorTodayConfig.value.schedule[selectedScheduleId.value] =
        newSchedule;
  }
}

function handleSubjectSelect(subjectId: string) {
  if (selectedScheduleId.value && subjectId) {
    const subject = subjects.value[subjectId];
    if (subject) {
      handleUpdate("name", subject.name);
      handleUpdate("shortName", subject.shortName);
      handleUpdate("teacherName", subject.teacherName);
      showSubjectSelector.value = false;
    }
  }
}

function addSchedule() {
  if (!scheduleEditorTodayConfig.value.schedule) {
    scheduleEditorTodayConfig.value.schedule = {};
  }

  const now = DateTime.now();
  const newSchedule: todaySchedule = {
    type: "lesson",
    name: "新课程",
    shortName: "新",
    teacherName: "",
    noDisplayedSeparately: false,
    startTime: now.set({hour: 8, minute: 0, second: 0, millisecond: 0}),
    endTime: now.set({hour: 9, minute: 0, second: 0, millisecond: 0}),
  };

  const uuid = uuidv4();
  scheduleEditorTodayConfig.value.schedule[uuid] = newSchedule;
  selectedScheduleId.value = uuid;
}

function copySchedule(id: string) {
  if (scheduleEditorTodayConfig.value.schedule?.[id]) {
    const schedule = scheduleEditorTodayConfig.value.schedule[id];
    const newSchedule: todaySchedule = {
      ...schedule,
    };
    if (newSchedule.type !== "dividingLine") {
      newSchedule.name = `${newSchedule.name} (副本)`;
    }
    const uuid = uuidv4();
    scheduleEditorTodayConfig.value.schedule[uuid] = newSchedule;
    selectedScheduleId.value = uuid;
  }
}

function deleteSchedule(id: string) {
  if (scheduleEditorTodayConfig.value.schedule?.[id]) {
    delete scheduleEditorTodayConfig.value.schedule[id];
    if (selectedScheduleId.value === id) {
      selectedScheduleId.value = "";
    }
  }
}

defineExpose({
  addSchedule,
  copySchedule,
  deleteSchedule,
});
type withName = todayScheduleLesson | todayScheduleBreak;
</script>

<template>
  <div class="flex gap-4 h-[100%]">
    <!-- 左侧面板 -->
    <div class="flex-1 max-w-60 flex flex-col">
      <!-- 标题 -->
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">课程列表</h2>
      </div>

      <!-- 列表卡片 -->
      <div
          class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
      >
        <!-- 操作按钮 -->
        <div class="p-2 flex gap-2 border-b border-gray-200">
          <TcButton
              class="flex-1"
              variant="filled"
              @click="addSchedule"
          >
            添加
          </TcButton>
          <TcButton
              :disabled="!selectedScheduleId"
              class="flex-1"
              variant="tonal"
              @click="copySchedule(selectedScheduleId)"
          >
            复制
          </TcButton>
          <TcButton
              :disabled="!selectedScheduleId"
              class="flex-1"
              color="error"
              variant="tonal"
              @click="deleteSchedule(selectedScheduleId)"
          >
            删除
          </TcButton>
        </div>

        <!-- 列表内容 -->
        <div class="flex-1 overflow-y-auto scrollbar-stable bg-gray-50">
          <div class="p-2 flex flex-col gap-2">
            <TransitionGroup
                class="flex flex-col gap-2"
                name="list"
                tag="div"
            >
              <button
                  v-for="[id, item] in sortedSchedule"
                  :key="id"
                  :class="[
                                    selectedScheduleId === id
                                        ? 'bg-[#0078D4]/10 text-[#0078D4] shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
                                ]"
                  class="text-left px-4 py-3 rounded-lg transition-all duration-200 select-none"
                  @click="selectedScheduleId = id"
              >
                <div class="flex flex-col gap-1">
                  <div class="flex items-center">
                    <div class="flex items-center gap-2">
                      <template
                          v-if="
                                                    item.type !== 'dividingLine'
                                                "
                      >
                                                <span class="font-medium">{{
                                                    item.name
                                                  }}</span>
                        <span
                            v-if="item.shortName"
                            class="text-sm opacity-60"
                        >({{
                            item.shortName
                          }})</span
                        >
                      </template>
                      <template v-else>
                                                <span
                                                    class="text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded whitespace-nowrap"
                                                >
                                                    分割线
                                                </span>
                      </template>
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 pl-0.5">
                    {{ item.startTime.toFormat("HH:mm") }}
                    <template
                        v-if="item.type !== 'dividingLine'"
                    >
                      -
                      {{ item.endTime.toFormat("HH:mm") }}
                    </template>
                  </div>
                </div>
              </button>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">课程详情</h2>
      </div>
      <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm">
        <div
            v-if="
                        selectedScheduleId &&
                        scheduleEditorTodayConfig.schedule[selectedScheduleId]
                    "
            class="p-6"
        >
          <template
              v-if="
                            scheduleEditorTodayConfig.schedule[
                                selectedScheduleId
                            ].type !== 'dividingLine'
                        "
          >
            <div class="text-2xl font-medium text-gray-800">
              {{
                (
                    scheduleEditorTodayConfig.schedule[
                        selectedScheduleId
                        ] as withName
                ).name
              }}
              <span
                  v-if="
                              ( scheduleEditorTodayConfig.schedule[
                                    selectedScheduleId
                                ] as withName).shortName 
                            "
                  class="text-sm text-gray-500 ml-2"
              >({{
                  (
                      scheduleEditorTodayConfig.schedule[
                          selectedScheduleId
                          ] as withName
                  ).shortName
                }})</span
              >
            </div>
          </template>

          <div class="space-y-4 mt-6">
            <!-- 类型选择 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">类型</label>
              <select
                  :value="
                                    scheduleEditorTodayConfig.schedule[
                                        selectedScheduleId
                                    ].type
                                "
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                  @change="(e) => updateType((e.target as HTMLSelectElement).value as 'lesson' | 'break' | 'dividingLine')"
              >
                <option value="lesson">课程</option>
                <option value="break">课间</option>
                <option value="dividingLine">分割线</option>
              </select>
            </div>

            <template
                v-if="
                                scheduleEditorTodayConfig.schedule[
                                    selectedScheduleId
                                ].type === 'lesson'
                            "
            >
              <!-- 科目选择器 -->
              <div class="relative">
                <TcButton
                    class="w-full"
                    variant="tonal"
                    @click="
                                        showSubjectSelector =
                                            !showSubjectSelector
                                    "
                >
                  修改为其他科目
                </TcButton>

                <!-- 弹出菜单 -->
                <div
                    v-if="showSubjectSelector"
                    class="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                >
                  <div class="p-1">
                    <button
                        v-for="(subject, id) in subjects"
                        :key="id"
                        class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
                        @click="
                                                handleSubjectSelect(String(id))
                                            "
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
            </template>
            <div class="h-px bg-gray-200 my-4"></div>
            <template
                v-if="
                                scheduleEditorTodayConfig.schedule[
                                    selectedScheduleId
                                ].type !== 'dividingLine'
                            "
            >
              <div class="space-y-2">
                <label class="text-sm text-gray-600"
                >课程名称</label
                >
                <TcInput
                    :model-value="
                                    (scheduleEditorTodayConfig.schedule[
                                        selectedScheduleId
                                    ] as withName).name
                                "
                    placeholder="请输入课程名称"
                    @update:model-value="
                                        (v) => handleUpdate('name', v)
                                    "
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm text-gray-600"
                >简称</label
                >
                <TcInput
                    :model-value="
                                    (scheduleEditorTodayConfig.schedule[
                                        selectedScheduleId
                                    ] as withName).shortName
                                "
                    placeholder="请输入课程简称"
                    @update:model-value="
                                        (v) => handleUpdate('shortName', v)
                                    "
                />
              </div>
            </template>

            <template
                v-if="
                                scheduleEditorTodayConfig.schedule[
                                    selectedScheduleId
                                ].type === 'lesson'
                            "
            >
              <div class="space-y-2">
                <label class="text-sm text-gray-600"
                >教师姓名</label
                >
                <TcInput
                    :model-value="
                                    (scheduleEditorTodayConfig.schedule[
                                        selectedScheduleId
                                    ] as todayScheduleLesson).teacherName
                                "
                    placeholder="请输入教师姓名"
                    @update:model-value="
                                        (v) => handleUpdate('teacherName', v)
                                    "
                />
              </div>
            </template>

            <div class="h-px bg-gray-200 my-4"></div>

            <div class="space-y-2">
              <label class="text-sm text-gray-600"
              >开始时间</label
              >
              <input
                  :value="
                                    scheduleEditorTodayConfig.schedule[
                                        selectedScheduleId
                                    ].startTime.toFormat('HH:mm')
                                "
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                  type="time"
                  @change="(e) => handleUpdate('startTime', (e.target as HTMLInputElement).value)"
              />
            </div>
            <template
                v-if="
                                scheduleEditorTodayConfig.schedule[
                                    selectedScheduleId
                                ].type !== 'dividingLine'
                            "
            >
              <div class="space-y-2">
                <label class="text-sm text-gray-600"
                >结束时间</label
                >
                <input
                    :value="
                                    (scheduleEditorTodayConfig.schedule[
                                        selectedScheduleId
                                    ] as withName).endTime.toFormat('HH:mm')
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
                  >合并显示</label
                  >
                  <TcSwitch
                      :model-value="
                                        (scheduleEditorTodayConfig.schedule[
                                            selectedScheduleId
                                        ] as withName).noDisplayedSeparately
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
                  启用后，该课程将在单独的位置和其他的课程合并显示
                </div>
              </div>
            </template>
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
