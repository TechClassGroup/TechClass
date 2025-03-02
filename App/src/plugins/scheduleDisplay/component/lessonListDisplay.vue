<script lang="ts" setup>
import {normalLessonList} from "../cycle";
</script>

<template>
  <div class="h-full w-full flex flex-col gap-1 p-1 overflow-hidden">
    <template v-for="(item, index) in normalLessonList" :key="item.id">
      <!-- 分割线 -->
      <div
          v-if="item.lesson.type === 'dividingLine'"
          class="dividing-line border-t-2 border-gray-400 my-1 flex-shrink-0"
      ></div>

      <!-- 课程或休息 -->
      <div
          v-else
          class="flex-grow flex-shrink min-h-0 max-h-20 p-1 rounded-md bg-white border border-gray-200 shadow-sm transition-all duration-200"
      >
        <div class="font-medium text-center lesson-name">
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

<style scoped>
.lesson-name {
  font-size: clamp(0.75rem, 3vw, 1.5rem);
  line-height: 1.2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
