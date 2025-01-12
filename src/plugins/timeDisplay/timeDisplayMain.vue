<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {PluginProps} from "@/types/plugins";

const currentTime = ref('')

const props = defineProps<PluginProps>()

const updateTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentTime.value = [
    props.store.storage.displayHour ? hours : null,
    props.store.storage.displayMinute ? minutes : null,
    props.store.storage.displaySecond ? seconds : null
  ]
      .filter(part => part !== null)
      .join(':')

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
             tracking-wider p-4 bg-white shadow-lg rounded-lg
             transition-all duration-300 hover:opacity-90
             flex items-center justify-center h-full cursor-pointer"

  >
    <span class="min-w-[160px] text-center">{{ currentTime }}</span>
  </div>

</template>

<style scoped>

/* nothing here */
</style>