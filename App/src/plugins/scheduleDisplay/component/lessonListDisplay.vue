<script lang="ts" setup>
import {noDisplayedSeparatelyLessonList, normalLessonList} from "../cycle";
import {computed} from "vue";
import {LessonListEnum, ScheduleWithIdWithoutDividingLine,} from "../scheduleDisplay.types";

/**
 * 非单独显示
 * 优先显示未来即将开始的课程（future状态）
 * 如果没有未来课程，则显示当前正在进行的课程（current状态）
 * 这些课程会在列表顶部突出显示，与普通课程列表分开
 */
const noDisplaySepLesson = computed<ScheduleWithIdWithoutDividingLine[]>(() => {
  const slotList = noDisplayedSeparatelyLessonList.value;

  // 查找 future 状态的课程
  const futureSlots = slotList.filter(
      (slot) => slot.status === LessonListEnum.future
  ) as ScheduleWithIdWithoutDividingLine[];
  if (futureSlots.length > 0) {
    return futureSlots;
  }

  // 如果没有 future 状态的课程，查找 current 状态的课程
  const currentSlots = slotList.filter(
      (slot) => slot.status === LessonListEnum.current
  ) as ScheduleWithIdWithoutDividingLine[];
  if (currentSlots.length > 0) {
    return currentSlots;
  }

  // 如果都没有，返回空数组
  return [];
});
</script>

<template>
  <div class="h-full w-full flex flex-col gap-1 p-1 overflow-hidden">
    <!-- 高亮显示的课程 -->
    <template v-if="noDisplaySepLesson.length > 0">
      <template v-for="(item, index) in noDisplaySepLesson" :key="item.id">
        <div
            class="flex-grow flex-shrink min-h-0 max-h-20 p-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all duration-200 flex items-center justify-center"
        >
          <div
              class="font-medium text-center text-[clamp(0.75rem,3vw,1.5rem)] leading-tight overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {{ item.lesson.name }}
          </div>
        </div>
      </template>

      <!-- 分隔区域 -->
      <div
          class="dividing-line border-t-2 border-gray-400 my-1 flex-shrink-0"
      ></div>
    </template>

    <!-- 常规课程列表 -->
    <template v-for="(item, index) in normalLessonList" :key="item.id">
      <!-- 分割线 -->
      <div
          v-if="item.lesson.type === 'dividingLine'"
          class="my-2 border-b border-gray-300"
      ></div>

      <div
          v-else
          class="flex-grow flex-shrink min-h-0 max-h-20 p-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all duration-200 flex items-center justify-center"
      >
        <div
            class="font-medium text-center text-[clamp(0.75rem,3vw,1.5rem)] leading-tight overflow-hidden whitespace-nowrap text-ellipsis"
        >
          {{ item.lesson.name }}
        </div>
      </div>
    </template>

    <!-- 无课程时显示 -->
    <div
        v-if="normalLessonList.length === 0"
        class="empty-state p-2 text-center text-gray-500"
    >
      暂无课程安排
    </div>
  </div>
</template>

<style scoped></style>
