<script setup lang="ts">
import {computed} from "vue";
import {TimetableObject} from "../../../scheduleEditor.types";
import {DateTime} from "luxon";
import TcInput from "../../../../../UI/TcInput.vue";
import TcSwitch from "../../../../../UI/TcSwitch.vue";
import {scheduleEditorProfile} from "../../../store/scheduleEditorProfile";

const selectedTimetableId = defineModel<string>("selectedTimetableId", {
  required: true,
});
const selectedLayoutId = defineModel<string>("selectedLayoutId", {
  required: true,
});
const timetables = defineModel<TimetableObject>("timetables", {
  required: true,
});

const subjects = scheduleEditorProfile.value.subjects;

const currentTimetable = computed(() => {
  if (
      !selectedTimetableId.value ||
      !timetables.value[selectedTimetableId.value]
  ) {
    return null;
  }
  return timetables.value[selectedTimetableId.value];
});

const currentLayout = computed(() => {
  if (
      !currentTimetable.value ||
      !selectedLayoutId.value ||
      !currentTimetable.value.layouts[selectedLayoutId.value]
  ) {
    return null;
  }
  return currentTimetable.value.layouts[selectedLayoutId.value];
});

function updateTimetableName(name: string) {
  if (!currentTimetable.value) return;
  currentTimetable.value.name = name;
}

function updateTime(field: "startTime" | "endTime", timeStr: string) {
  if (!currentLayout.value) return;

  // 验证时间格式
  const parts = timeStr.split(":");
  if (parts.length < 2) return;

  const [hours, minutes, seconds = "00"] = parts;
  const parsedHours = parseInt(hours);
  const parsedMinutes = parseInt(minutes);
  const parsedSeconds = parseInt(seconds);

  if (
      isNaN(parsedHours) ||
      isNaN(parsedMinutes) ||
      isNaN(parsedSeconds) ||
      parsedHours < 0 ||
      parsedHours > 23 ||
      parsedMinutes < 0 ||
      parsedMinutes > 59 ||
      parsedSeconds < 0 ||
      parsedSeconds > 59
  ) {
    // 如果时间无效，恢复到当前值
    return;
  }

  // 确保使用完整的时间格式
  const timeValue = `${hours.padStart(2, "0")}:${minutes.padStart(
      2,
      "0"
  )}:${seconds.padStart(2, "0")}`;
  const newTime = DateTime.fromFormat(timeValue, "HH:mm:ss");

  if (field === "startTime") {
    currentLayout.value.startTime = newTime;
    // 不处理分割线的结束时间
    if (currentLayout.value.type === "dividingLine") return;
    if (newTime >= currentLayout.value.endTime) {
      currentLayout.value.endTime = newTime;
    }
  } else {
    // 不处理分割线的结束时间
    if (currentLayout.value.type === "dividingLine") return;
    currentLayout.value.endTime = newTime;
    if (newTime <= currentLayout.value.startTime) {
      currentLayout.value.endTime = currentLayout.value.startTime;
    }
  }
}

function updateType(type: string) {
  if (!currentLayout.value) return;
  if (type !== "lesson" && type !== "break" && type !== "dividingLine")
    return;

  if (type === "lesson") {
    Object.assign(currentLayout.value, {
      type: "lesson",
      subjectId: "",
      noDisplayedSeparately: false,
    });
  } else if (type === "break") {
    Object.assign(currentLayout.value, {
      type: "break",
      breakName: "课间",
      breakShortName: "课",
      noDisplayedSeparately: true,
    });
  } else {
    Object.assign(currentLayout.value, {
      type: "dividingLine",
    });
  }
}

function updateBreakName(name: string) {
  if (!currentLayout.value || currentLayout.value.type !== "break") return;
  currentLayout.value.breakName = name;
}

function updateBreakShortName(name: string) {
  if (!currentLayout.value || currentLayout.value.type !== "break") return;
  currentLayout.value.breakShortName = name;
}

function updateSubject(subjectId: string) {
  if (!currentLayout.value || currentLayout.value.type !== "lesson") return;
  currentLayout.value.subjectId = subjectId;
}

function formatTimeForInput(time: DateTime): string {
  return time.toFormat("HH:mm:ss");
}

function updateNoDisplayedSeparately(noDisplayedSeparately: boolean) {
  if (!currentLayout.value) return;
  if (currentLayout.value.type === "dividingLine") return;
  currentLayout.value.noDisplayedSeparately = noDisplayedSeparately;
}
</script>

<template>
  <div
      class="p-4 overflow-y-auto flex flex-col gap-6 h-full"
      style="scrollbar-gutter: stable"
  >
    <!-- 时间表基本信息 -->
    <div v-if="currentTimetable" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">时间表设置</h3>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
        >时间表名称</label
        >
        <TcInput
            :model-value="currentTimetable.name"
            placeholder="请输入时间表名称"
            @update:model-value="updateTimetableName"
        />
      </div>
    </div>

    <div
        v-if="currentTimetable"
        class="h-[1px] bg-gray-200 flex-none"
    ></div>

    <!-- 课程布局详情 -->
    <template v-if="currentLayout">
      <!-- 类型选择 -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">类型设置</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
          >选择类型</label
          >
          <select
              :value="currentLayout.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
              @change="(e) => updateType((e.target as HTMLSelectElement).value)"
          >
            <option value="lesson">课程</option>
            <option value="break">课间</option>
            <option value="dividingLine">分割线</option>
          </select>
        </div>
      </div>
      <!-- 时间设置 -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">时间设置</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label
                class="block text-sm font-medium text-gray-700 mb-1"
            >开始时间</label
            >
            <TcInput
                :model-value="
                                formatTimeForInput(currentLayout.startTime)
                            "
                max="23:59:59"
                min="00:00:00"
                step="1"
                type="time"
                @update:model-value="
                                (value) => updateTime('startTime', value)
                            "
            />
          </div>
          <div v-if="currentLayout.type !== 'dividingLine'">
            <label
                class="block text-sm font-medium text-gray-700 mb-1"
            >结束时间</label
            >
            <TcInput
                :model-value="
                                formatTimeForInput(currentLayout.endTime)
                            "
                max="23:59:59"
                min="00:00:00"
                step="1"
                type="time"
                @update:model-value="
                                (value) => updateTime('endTime', value)
                            "
            />
          </div>
        </div>
      </div>

      <!-- 课程设置 -->
      <div v-if="currentLayout.type === 'lesson'" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">课程设置</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
          >选择默认课程</label
          >
          <select
              :value="currentLayout.subjectId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
              @change="(e) => updateSubject((e.target as HTMLSelectElement).value)"
          >
            <option value="">无</option>
            <option
                v-for="(subject, id) in subjects"
                :key="id"
                :value="id"
            >
              {{ subject.name }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700"
          >合并显示</label
          >
          <TcSwitch
              :model-value="currentLayout.noDisplayedSeparately"
              @update:model-value="updateNoDisplayedSeparately"
          />
        </div>
      </div>

      <div v-if="currentLayout.type === 'break'" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">课间名称</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
          >课间名称</label
          >
          <TcInput
              :model-value="currentLayout.breakName"
              placeholder="例如：课间休息"
              @update:model-value="updateBreakName"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
          >课间简称</label
          >
          <TcInput
              :model-value="currentLayout.breakShortName"
              placeholder="例如：课"
              @update:model-value="updateBreakShortName"
          />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700"
          >合并显示</label
          >
          <TcSwitch
              :model-value="currentLayout.noDisplayedSeparately"
              @update:model-value="updateNoDisplayedSeparately"
          />
        </div>
      </div>
    </template>

    <div
        v-else-if="!selectedTimetableId"
        class="p-4 text-center text-gray-500"
    >
      请选择一个时间表
    </div>
    <div v-else class="p-4 text-center text-gray-500">
      请选择一个课程进行编辑
    </div>
  </div>
</template>

<style scoped>
input[type="time"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
}
</style>
