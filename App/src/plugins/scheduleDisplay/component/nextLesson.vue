<script lang="ts" setup>
import {computed} from "vue";
import {lessonStatus} from "../cycle";
import {DateTime} from "luxon";
import {LessonStatusEnum} from "../scheduleDisplay.types";

const nextLessonInfo = computed(() => {
  const status = lessonStatus.value;
  const now = DateTime.now();

  if (status.status === LessonStatusEnum.noLesson) {
    return {text: "暂无课程", remainingTime: null, lessons: []};
  }

  if (status.status === LessonStatusEnum.afterLast) {
    return {text: "今天的课程已结束", remainingTime: null, lessons: []};
  }

  if (status.futureLessons.length > 0) {
    const futureLessons = status.futureLessons;
    const startTime = futureLessons[0].lesson.startTime;
    const duration = startTime.diff(now);
    return {
      text: "距离",
      remainingTime: duration,
      lessons: futureLessons.map((lesson) => lesson.lesson.name),
    };
  }

  if (status.currentLessons.length > 0) {
    const currentLesson = status.currentLessons[0];
    const endTime = currentLesson.lesson.endTime;
    const duration = endTime.diff(now);
    return {
      text: "距离课程结束",
      remainingTime: duration,
      lessons: [],
    };
  }

  return {text: "今天的课程已结束", remainingTime: null, lessons: []};
});

const formatDuration = computed(() => {
  const duration = nextLessonInfo.value.remainingTime;
  if (!duration) return "";

  const hours = Math.floor(duration.as("hours"));
  const minutes = Math.floor(duration.as("minutes") % 60);
  const seconds = Math.floor(duration.as("seconds") % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
});
</script>

<template>
  <div
      class="select-none text-4xl font-light text-gray-800 tracking-wider p-4 bg-white shadow-lg rounded-lg hover:opacity-90 flex flex-col items-center justify-center h-full cursor-pointer gap-1"
  >
    <template v-if="nextLessonInfo.remainingTime">
      <div class="text-2xl text-gray-600">
        {{ nextLessonInfo.text }}
        <template
            v-for="(lesson, index) in nextLessonInfo.lessons"
            :key="index"
        >
          <span class="font-medium">{{ lesson }}</span>
          <span v-if="index < nextLessonInfo.lessons.length - 1"
          >、</span
          >
        </template>
      </div>
      <div class="text-4xl font-medium text-[rgb(43,173,242)]">
        {{ formatDuration }}
      </div>
    </template>
    <div v-else class="text-2xl text-gray-600">
      {{ nextLessonInfo.text }}
    </div>
  </div>
</template>

<style scoped></style>
