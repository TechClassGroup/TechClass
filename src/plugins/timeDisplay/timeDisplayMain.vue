<script setup lang="ts">
import { ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const showSeconds = ref(true)

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = showSeconds.value 
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}`
}



let timer: number
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div 
    class="select-none text-4xl font-light text-gray-800 
           tracking-wider p-2 transition-all duration-300 hover:opacity-80
           flex items-center justify-center h-full cursor-pointer"
 
  >
    <span class="min-w-[160px] text-center">{{ currentTime }}</span>
  </div>
</template>

<style scoped>

/* nothing here */
</style>