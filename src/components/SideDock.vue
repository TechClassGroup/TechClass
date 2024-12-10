<script lang="ts" setup>
import {useApplicationStore} from "@/stores/useApplicationStore.ts";

const store = useApplicationStore();
</script>

<template>
  <div class="w-[40px] bg-blue-400 h-dvh flex flex-col p-1">
    <div></div>
    <button class="p-1 mt-auto" @click="store.reverseSettingOpen()">
      <img alt="设置页面" src="@assets/images/settings.svg">
    </button>
  </div>
</template>

<style scoped>

</style>