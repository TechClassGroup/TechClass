<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";

const hours = ref("");
const minutes = ref("");
const seconds = ref("");


const updateTime = () => {
  const now = new Date();
  hours.value = now.getHours().toString().padStart(2, "0");
  minutes.value = now.getMinutes().toString().padStart(2, "0");
  seconds.value = now.getSeconds().toString().padStart(2, "0");
};

let timer: number;
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
const config = {
  displayHour: true,
  displayMinute: true,
  displaySecond: true,
}
</script>

<template>
  <div
      class="select-none text-6xl font-light text-title tracking-wider p-4 bg-50 shadow-lg rounded-lg transition-all duration-300 hover:opacity-90 flex items-center justify-center h-full cursor-pointer gap-1"
  >
    <div class="min-w-[160px] flex items-center justify-center gap-2">
      <TransitionGroup name="time">
        <template v-if="config.displayHour">
          <span :key="'hours'" class="inline-block">{{ hours }}</span>
          <span
              v-if="
                          config.displayMinute || config.displaySecond
                        "
              :key="'colon1'"
              class="inline-block text-subtle"
          >:</span
          >
        </template>
        <template v-if="config.displayMinute">
                    <span :key="'minutes'" class="inline-block">{{
                        minutes
                      }}</span>
          <span
              v-if="config.displaySecond"
              :key="'colon2'"
              class="inline-block text-subtle"
          >:</span
          >
        </template>
        <span
            v-if="config.displaySecond"
            :key="'seconds'"
            class="inline-block"
        >{{ seconds }}</span
        >
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.time-move,
.time-enter-active,
.time-leave-active {
  transition: all 0.3s ease;
}

.time-enter-from,
.time-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.time-leave-active {
  position: absolute;
}
</style>
