<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue';
import {Store} from "pinia";

const props = defineProps<{
  store: Store;
}>();
console.log(props);
const currentTime = ref(new Date().toLocaleTimeString());
let timer: number | undefined;

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString();
};

onMounted(() => {
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full p-4 bg-gray-100">
    <div class="text-4xl font-bold mb-4">{{ currentTime }}</div>
  </div>
</template>

<style scoped>
</style>