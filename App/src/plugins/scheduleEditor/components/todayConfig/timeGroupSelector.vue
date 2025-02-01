<script lang="ts" setup>
import {computed} from "vue";
import {scheduleEditorProfile} from "../../store/scheduleEditorProfile";
import {scheduleEditorStore} from "../../store/scheduleStore";
import GroupSelector from "./components/groupSelector.vue";
import TempGroupSelector from "./components/tempGroupSelector.vue";
import EffectiveDisplay from "./components/effectiveDisplay.vue";

const curriculums = computed(() => scheduleEditorProfile.value.curriculums);
const timeGroups = computed(() => scheduleEditorProfile.value.timeGroups);

const selectedGroup = computed({
  get: () => scheduleEditorStore?.selectedGroup || {type: null, id: ""},
  set: (value) => {
    if (scheduleEditorStore) {
      scheduleEditorStore.selectedGroup = value;
    }
  },
});

const tempSelectedGroup = computed({
  get: () =>
      scheduleEditorStore?.tempSelectedGroup || {
        type: null,
        id: "",
        enable: false,
      },
  set: (value) => {
    if (scheduleEditorStore) {
      scheduleEditorStore.tempSelectedGroup = value;
    }
  },
});

function getItemName(type: "curriculum" | "timeGroup" | null, id: string) {
  if (!type || !id) return "未选择";
  if (type === "curriculum") {
    return scheduleEditorProfile.value.curriculums[id]?.name || "未知课表";
  } else {
    return scheduleEditorProfile.value.timeGroups[id]?.name || "未知时间组";
  }
}

function getItemInfo(type: "curriculum" | "timeGroup" | null, id: string) {
  if (!type || !id) return "";
  if (type === "curriculum") {
    const curriculum = scheduleEditorProfile.value.curriculums[id];
    if (!curriculum?.timetableId) return "未设置时间表";
    const timetable =
        scheduleEditorProfile.value.timetables[curriculum.timetableId];
    return `使用时间表: ${timetable?.name || "未知"}`;
  } else {
    const timeGroup = scheduleEditorProfile.value.timeGroups[id];
    if (!timeGroup) return "";
    const parts: string[] = [];
    if (timeGroup.granularity === "day") {
      parts.push(
          `每${
              timeGroup.dayCycleGranularity === "week"
                  ? "周"
                  : timeGroup.dayCycleGranularity === "month"
                      ? "月"
                      : "天"
          }`
      );
      parts.push(`${timeGroup.layout.length}个时段`);
    } else {
      parts.push(`每${timeGroup.granularity === "week" ? "周" : "月"}`);
      parts.push(`${timeGroup.layout.length}个时段`);
    }
    return parts.join(" · ");
  }
}

function selectItem(type: "curriculum" | "timeGroup", id: string) {
  selectedGroup.value = {type, id};
}

function selectTempItem(type: "curriculum" | "timeGroup", id: string) {
  tempSelectedGroup.value = {type, id, enable: true};
}

function toggleTempEnable(enable: boolean) {
  tempSelectedGroup.value = {...tempSelectedGroup.value, enable};
}
</script>

<template>
  <div class="flex gap-4 h-[100%]">
    <!-- 默认选择 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">默认选择</h2>
      </div>
      <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <GroupSelector v-model="selectedGroup" />
      </div>
    </div>

    <!-- 临时选择 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">临时选择</h2>
      </div>
      <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <TempGroupSelector v-model="tempSelectedGroup" />
      </div>
    </div>

    <!-- 功能区 -->
    <div class="flex-1 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">详情</h2>
      </div>
      <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-4 flex flex-col gap-6 bg-white">
          <EffectiveDisplay
              v-model:selectedGroup="selectedGroup"
              v-model:tempSelectedGroup="tempSelectedGroup"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-stable {
  scrollbar-gutter: stable;
}
</style>
