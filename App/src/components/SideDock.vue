<script lang="ts" setup>
import {useApplicationStore} from "../stores/useApplicationStore";
import {Settings} from "lucide-vue-next"

const store = useApplicationStore();
</script>

<template>
  <div class="w-[40px] bg-500 h-dvh flex flex-col p-1 shadow-md ">
    <div></div>
    <button class="p-1 mt-auto hover:bg-700 rounded-lg transition-colors"
            @click="store.reverseSettingOpen()">
      <Settings class="opacity-70 hover:opacity-100 transition-opacity text-normal" />
    </button>
  </div>
</template>

<style scoped>
</style>