<script lang="ts" setup>
import {noDisplayedSeparatelyLessonList, normalLessonList} from "../cycle";
import {computed} from "vue";
import {LessonListEnum, LessonListWithoutDividingLine,} from "../scheduleDisplay.types";

/**
 * 非单独显示
 * 优先显示未来即将开始的课程（future状态）
 * 如果没有未来课程，则显示当前正在进行的课程（current状态）
 * 这些课程会在列表顶部突出显示，与普通课程列表分开
 */
const noDisplaySepLesson = computed<LessonListWithoutDividingLine>(() => {
  const slotList =
      noDisplayedSeparatelyLessonList.value as LessonListWithoutDividingLine;

  // 查找 future 状态的课程
  const futureSlots = slotList.filter(
      (slot) => slot.status === LessonListEnum.future
  );
  if (futureSlots.length > 0) {
    return futureSlots;
  }

  // 如果没有 future 状态的课程，查找 current 状态的课程
  const currentSlots = slotList.filter(
      (slot) => slot.status === LessonListEnum.current
  );
  if (currentSlots.length > 0) {
    return currentSlots;
  }

  // 如果都没有，返回空数组
  return [];
});
</script>

<template>
  <div class="h-full w-full flex flex-col gap-1 p-1 overflow-hidden">
    <!-- 合并后的 TransitionGroup，添加 flex-1 和 overflow-y-auto -->
    <TransitionGroup
        class="flex-1 flex flex-col gap-1 overflow-y-auto"
        name="list"
        tag="div"
    >
      <!-- 非单独显示的课程 -->
      <template v-if="noDisplaySepLesson.length > 0">
        <!-- 非单独显示课程的循环 -->
        <template v-for="item in noDisplaySepLesson" :key="item.id">
          <div
              class="flex-grow flex-shrink min-h-0 p-1 rounded-md bg-50 border border-gray-200 shadow-sm transition-all duration-200 flex items-center justify-center relative"
          >
            <div
                class="font-medium text-center text-[clamp(0.75rem,3vw,1.5rem)] leading-tight overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {{ item.lesson.name }}
            </div>
            <!-- 状态指示器 -->
            <Transition name="slide-fade">
              <div
                  v-if="
                                    item.status === LessonListEnum.future ||
                                    item.status === LessonListEnum.current
                                "
                  :class="{
                                    'bg-red-500 text-white':
                                        item.status === LessonListEnum.future,
                                    'bg-green-500 text-white':
                                        item.status === LessonListEnum.current,
                                }"
                  class="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 rounded-l-md text-sm font-medium"
              >
                {{
                  item.status === LessonListEnum.future
                      ? "未来"
                      : "当前"
                }}
              </div>
            </Transition>
          </div>
        </template>
        <!-- 分隔区域 -->
        <div
            key="divider-sep"
            class="dividing-line border-t-2 border-gray-400 my-1 flex-shrink-0"
        ></div>
      </template>

      <!-- 常规课程列表 -->
      <template v-for="item in normalLessonList" :key="item.id">
        <!-- 分割线 -->
        <div
            v-if="item.lesson.type === 'dividingLine'"
            class="my-2 border-b border-gray-300 flex-shrink-0"
        ></div>

        <!-- 常规课程项 -->
        <div
            v-else
            class="flex-grow flex-shrink min-h-0 p-1 rounded-md bg-50 border border-gray-200 shadow-sm transition-all duration-200 flex items-center justify-center relative"
        >
          <div
              class="font-medium text-center text-[clamp(0.75rem,3vw,1.5rem)] leading-tight overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {{ item.lesson.name }}
          </div>
          <!-- 状态指示器 -->
          <Transition name="slide-fade">
            <div
                v-if="
                                item.status === LessonListEnum.future ||
                                item.status === LessonListEnum.current
                            "
                :class="{
                                'bg-red-500 text-white':
                                    item.status === LessonListEnum.future,
                                'bg-green-500 text-white':
                                    item.status === LessonListEnum.current,
                            }"
                class="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-1 rounded-l-md text-sm font-medium"
            >
              {{
                item.status === LessonListEnum.future
                    ? "未来"
                    : "当前"
              }}
            </div>
          </Transition>
        </div>
      </template>

      <!-- 无课程时显示 (整合到TransitionGroup内部) -->
      <template
          v-if="
                    noDisplaySepLesson.length === 0 &&
                    normalLessonList.length === 0
                "
      >
        <div
            key="empty-state"
            class="empty-state p-2 text-center text-muted flex-grow flex items-center justify-center"
        >
          暂无课程安排
        </div>
      </template>
    </TransitionGroup>

    <!-- 原本的无课程显示逻辑被注释或移除，因为它已被整合到上面的 TransitionGroup 中 -->
    <!-- <Transition name="fade">
  <div
      v-if="normalLessonList.length === 0 && noDisplaySepLesson.length === 0"
      class="empty-state p-2 text-center text-muted flex-grow flex items-center justify-center"
  >
    暂无课程安排
  </div>
</Transition> -->
  </div>
</template>

<style scoped>
/* 列表动画 */
.list-move {
  transition: transform 0.3s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  transform: translateY(-30px);
  opacity: 0;
}

.list-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}

/* 状态指示器滑动动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translate(30px, -50%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translate(30px, -50%);
  opacity: 0;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
