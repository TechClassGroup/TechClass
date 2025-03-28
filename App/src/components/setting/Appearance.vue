<script lang="ts" setup>
import {useApplicationStore} from "../../stores/useApplicationStore";
import SettingItem from "../utils/SettingItem.vue";

const store = useApplicationStore();


</script>

<template>
  <div class="p-4">
    <div class="flex items-center mb-6">
      <h1 class="text-2xl font-medium leading-8">外观设置</h1>
    </div>

    <div class="space-y-4">
      <setting-item>
        <template #title>基础颜色</template>
        <template #description>
          设置应用的基础颜色
        </template>

      </setting-item>
    </div>
  </div>
</template>

<style scoped>

</style>
