<script lang="ts" setup>
import {useApplicationStore} from "../stores/useApplicationStore";

const store = useApplicationStore();
</script>

<template>
  <div class="w-[40px] bg-gray-200 h-dvh flex flex-col p-1 shadow-md">
    <div></div>
    <button class="p-1 mt-auto hover:bg-gray-300 rounded-lg transition-colors" 
            @click="store.reverseSettingOpen()">
      <img alt="设置页面" src="../assets/images/settings.svg"
           class="opacity-70 hover:opacity-100 transition-opacity">
    </button>
  </div>
</template>

<style scoped>
</style>