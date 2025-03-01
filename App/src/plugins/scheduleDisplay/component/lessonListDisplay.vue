<script lang="ts" setup>
import {normalLessonList} from "../cycle";
</script>

<template>
  <div class="p-4 flex flex-col gap-2">
    <template v-for="(item, index) in normalLessonList" :key="item.id">
      <!-- 分割线 -->
      <div
          v-if="item.lesson.type === 'dividingLine'"
          class="dividing-line border-t-2 border-gray-300 my-2"
      ></div>

      <!-- 课程或休息 -->
      <div
          v-else
          class="p-3 rounded-md bg-white border border-gray-200 shadow-sm transition-all duration-200"
      >
        <div class="font-medium text-center text-2xl">
          {{ item.lesson.name }}
        </div>
      </div>
    </template>

    <!-- 无课程时显示 -->
    <div
        v-if="normalLessonList.length === 0"
        class="empty-state p-6 text-center text-gray-500"
    >
      暂无课程安排
    </div>
  </div>
</template>

<style scoped></style>
