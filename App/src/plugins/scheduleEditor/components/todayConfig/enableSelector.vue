<script lang="ts" setup>
import {computed} from "vue";
import {scheduleEditorProfile} from "../../store/scheduleEditorProfile";

const store = scheduleEditorProfile.value;

interface SelectableItem {
  type: "curriculum" | "timegroup";
  id: string;
  name: string;
}

// 计算可选择的课程表和时间组
const selectableItems = computed<SelectableItem[]>(() => {
  const items: SelectableItem[] = [];
  // 添加课程表
  Object.entries(store.curriculums).forEach(([id, curriculum]) => {
    items.push({
      type: "curriculum",
      id,
      name: curriculum.name,
    });
  });
  // 添加时间组
  Object.entries(store.timeGroups).forEach(([id, timeGroup]) => {
    items.push({
      type: "timegroup",
      id,
      name: timeGroup.name,
    });
  });
  return items;
});

// 当前选中的项目
const selectedItem = computed({
  get: () => store.enableConfig.selected,
  set: (value: { type: "curriculum" | "timegroup"; id: string }) => {
    store.enableConfig.selected = value;
  },
});

// 获取当前选中项目的名称
const getItemName = (type: "curriculum" | "timegroup", id: string) => {
  if (type === "curriculum") {
    return store.curriculums[id]?.name || "未知课程表";
  } else {
    return store.timeGroups[id]?.name || "未知时间组";
  }
};
</script>

<template>
  <div class="flex gap-4 h-[100%]">
    <!-- 左侧选择列表 -->
    <div class="w-2/5 flex flex-col">
      <div class="bg-white rounded-lg p-2 mb-2 shadow-sm">
        <h2 class="text-lg font-medium px-2 text-center">当前启用</h2>
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
                            ]"
                class="px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
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
        <div v-if="selectedItem.id" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-gray-600">名称</div>
            <div>
              {{
                getItemName(selectedItem.type, selectedItem.id)
              }}
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
