<script lang="ts" setup>
import {computed, onMounted} from "vue";
import {scheduleEditorProfile} from "../../store/scheduleEditorProfile";
import {DateTime} from "luxon";
import TcSwitch from "../../../../UI/TcSwitch.vue";

const store = scheduleEditorProfile.value;

interface SelectableItem {
  type: "curriculum" | "timegroup";
  id: string;
  name: string;
}

// 计算可选择的课程表和时间组
const selectableItems = computed<SelectableItem[]>(() => {
  const items: SelectableItem[] = [];

  // 添加时间组
  Object.entries(store.timeGroups).forEach(([id, timeGroup]) => {
    items.push({
      type: "timegroup",
      id,
      name: timeGroup.name,
    });
  });
  // 添加课程表
  Object.entries(store.curriculums).forEach(([id, curriculum]) => {
    items.push({
      type: "curriculum",
      id,
      name: curriculum.name,
    });
  });
  return items;
});

// 临时启用状态
const tempEnabled = computed({
  get: () => store.enableConfig.tempSelected.enable,
  set: (value: boolean) => {
    store.enableConfig.tempSelected.enable = value;
    if (value && !store.enableConfig.tempSelected.id) {
      // 如果启用但没有选择项目，设置默认值
      const firstItem = selectableItems.value[0];
      if (firstItem) {
        store.enableConfig.tempSelected.type = firstItem.type;
        store.enableConfig.tempSelected.id = firstItem.id;
      }
      // 设置默认时间范围
      const now = DateTime.now();
      store.enableConfig.tempSelected.startTime = now;
      store.enableConfig.tempSelected.endTime = now.plus({days: 1});
    }
  },
});

// 当前选中的项目
const selectedItem = computed({
  get: () => ({
    type: store.enableConfig.tempSelected.type,
    id: store.enableConfig.tempSelected.id,
  }),
  set: (value: { type: "curriculum" | "timegroup"; id: string }) => {
    store.enableConfig.tempSelected.type = value.type;
    store.enableConfig.tempSelected.id = value.id;
  },
});

// 开始时间
const startTime = computed({
  get: () => store.enableConfig.tempSelected.startTime,
  set: (value: DateTime) => {
    store.enableConfig.tempSelected.startTime = value;
    // 确保结束时间不早于开始时间
    if (store.enableConfig.tempSelected.endTime < value) {
      store.enableConfig.tempSelected.endTime = value;
    }
  },
});

// 结束时间
const endTime = computed({
  get: () => store.enableConfig.tempSelected.endTime,
  set: (value: DateTime) => {
    // 确保结束时间不早于开始时间
    if (value < store.enableConfig.tempSelected.startTime) {
      value = store.enableConfig.tempSelected.startTime;
    }
    store.enableConfig.tempSelected.endTime = value;
  },
});

// 获取当前选中项目的名称
const itemNames = computed(() => {
  const names: Record<string, string> = {};
  Object.entries(store.curriculums).forEach(([id, curriculum]) => {
    names[`curriculum-${id}`] = curriculum.name;
  });
  Object.entries(store.timeGroups).forEach(([id, timeGroup]) => {
    names[`timegroup-${id}`] = timeGroup.name;
  });
  return names;
});

const getItemName = (type: "curriculum" | "timegroup", id: string) => {
  const key = `${type}-${id}`;
  return (
      itemNames.value[key] ||
      (type === "curriculum" ? "未知课程表" : "未知时间组")
  );
};

// 获取项目的详细信息
const itemInfos = computed(() => {
  const infos: Record<string, string> = {};

  Object.entries(store.curriculums).forEach(([id, curriculum]) => {
    infos[`curriculum-${id}`] = `共 ${curriculum.classes.length} 节课程`;
  });

  Object.entries(store.timeGroups).forEach(([id, timeGroup]) => {
    const parts: string[] = [];
    parts.push(`共 ${timeGroup.cycle} 项`);

    if (
        timeGroup.granularity !== "day" ||
        timeGroup.dayCycleGranularity === "custom"
    ) {
      if (timeGroup.startTime) {
        parts.push(timeGroup.startTime.toFormat("yyyy-MM-dd"));
      } else {
        parts.push("继承开始时间");
      }
    }

    infos[`timegroup-${id}`] = parts.join(" / ");
  });

  return infos;
});

const getItemInfo = (item: SelectableItem) => {
  const key = `${item.type}-${item.id}`;
  return itemInfos.value[key] || "";
};

// 组件挂载时检查时间
onMounted(() => {
  if (store.enableConfig.tempSelected.enable) {
    const now = DateTime.now();
    if (now > store.enableConfig.tempSelected.endTime) {
      store.enableConfig.tempSelected.enable = false;
    }
  }
});
</script>

<template>
  <div class="flex gap-4 h-[100%]">
    <!-- 左侧选择列表 -->
    <div class="w-2/5 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">临时启用</h2>
      </div>
      <div class="flex-1 overflow-y-auto scrollbar-stable bg-gray-50">
        <div class="flex flex-col gap-2 p-2 rounded-lg h-full">
          <TransitionGroup
              class="flex flex-col gap-2"
              name="list"
              tag="div"
          >
            <div
                v-for="item in selectableItems"
                :key="`${item.type}-${item.id}`"
                :class="[
                                selectedItem.type === item.type &&
                                selectedItem.id === item.id
                                    ? 'bg-[#0078D4]/10 text-[#0078D4] shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200 hover:translate-x-1',
                                'cursor-pointer',
                            ]"
                class="px-4 py-3 rounded-lg transition-all duration-200 select-none"
                @click="
                                selectedItem = { type: item.type, id: item.id }
                            "
            >
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                                    <span class="font-medium">{{
                                        item.name
                                      }}</span>
                  <span
                      :class="[
                                            'text-xs px-1.5 py-0.5 rounded',
                                            item.type === 'curriculum'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700',
                                        ]"
                  >
                                        {{
                      item.type === "curriculum"
                          ? "课程表"
                          : "时间组"
                    }}
                                    </span>
                </div>
                <div class="text-xs text-gray-500 pl-0.5">
                  {{ getItemInfo(item) }}
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- 右侧信息展示 -->
    <div class="w-3/5 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm relative">
        <h2 class="text-lg font-medium px-2 text-center">详细信息</h2>
      </div>
      <div
          class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden p-4"
      >
        <!-- 启用开关 -->
        <div
            class="mb-6 flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
        >
          <span class="text-gray-700 font-medium">临时启用</span>
          <tc-switch v-model="tempEnabled" />
        </div>

        <div v-if="selectedItem.id" class="space-y-6">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 border-b pb-2">
              基本信息
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-gray-600">名称</div>
              <div>
                {{
                  getItemName(
                      selectedItem.type,
                      selectedItem.id
                  )
                }}
              </div>
              <div class="text-gray-600">类型</div>
              <div>
                {{
                  selectedItem.type === "curriculum"
                      ? "课程表"
                      : "时间组"
                }}
              </div>
            </div>
          </div>

          <!-- 时间设置 -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-700 border-b pb-2">
              时间设置
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-gray-600">开始时间</div>
              <input
                  :value="
                                    startTime.toFormat('yyyy-MM-dd\'T\'HH:mm')
                                "
                  class="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                  type="datetime-local"
                  @input="
                                    startTime = DateTime.fromFormat(
                                        ($event.target as HTMLInputElement)
                                            .value,
                                        'yyyy-MM-dd\'T\'HH:mm'
                                    )
                                "
              />
              <div class="text-gray-600">结束时间</div>
              <input
                  :value="
                                    endTime.toFormat('yyyy-MM-dd\'T\'HH:mm')
                                "
                  class="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4]"
                  type="datetime-local"
                  @input="
                                    endTime = DateTime.fromFormat(
                                        ($event.target as HTMLInputElement)
                                            .value,
                                        'yyyy-MM-dd\'T\'HH:mm'
                                    )
                                "
              />
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 mt-4">
          请选择一个课程表或时间组
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
</style>
