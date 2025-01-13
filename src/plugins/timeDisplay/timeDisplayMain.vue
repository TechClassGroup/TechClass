<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {PluginProps} from "@/types/plugins";

const hours = ref("");
const minutes = ref("");
const seconds = ref("");

const props = defineProps<PluginProps>();

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
</script>

<template>
  <div
      class="select-none text-4xl font-light text-gray-800 tracking-wider p-4 bg-white shadow-lg rounded-lg transition-all duration-300 hover:opacity-90 flex items-center justify-center h-full cursor-pointer gap-1"
  >
    <div class="min-w-[160px] flex items-center justify-center gap-2">
      <TransitionGroup name="time">
        <template v-if="props.store.storage.displayHour">
          <span :key="'hours'" class="inline-block">{{ hours }}</span>
          <span
              v-if="
                            props.store.storage.displayMinute ||
                            props.store.storage.displaySecond
                        "
              :key="'colon1'"
              class="inline-block text-gray-400"
          >:</span
          >
        </template>
        <template v-if="props.store.storage.displayMinute">
                    <span :key="'minutes'" class="inline-block">{{
                        minutes
                      }}</span>
          <span
              v-if="props.store.storage.displaySecond"
              :key="'colon2'"
              class="inline-block text-gray-400"
          >:</span
          >
        </template>
        <span
            v-if="props.store.storage.displaySecond"
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
