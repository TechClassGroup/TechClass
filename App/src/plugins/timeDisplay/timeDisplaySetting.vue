<script setup lang="ts">
import TcSwitch from "../../UI/TcSwitch.vue";
import {computed, toRaw, watch} from "vue";

import {componentProps} from "../../core/plugins-systems/types/component.type";

const props = defineProps<componentProps>()
const config = toRaw(props.plugin.storage)!.content 
const isSecondDisabled = computed(() => {
  return (
      (config.value.displayHour && !config.value.displayMinute) ||
      !config.value.displayMinute
  );
});

watch(isSecondDisabled, (newValue) => {
  if (newValue) {
    config.value.displaySecond = false;
  }
});
</script>

<template>
  <div class="p-4 bg-50 rounded-lg shadow-md">
    <div class="space-y-4">
      <div
          class="flex items-center justify-between p-3 bg-100 rounded-lg"
      >
        <span class="text-normal">显示小时</span>
        <tc-switch
            v-model="config.displayHour"
            class="ml-2"

        ></tc-switch>
      </div>
      <div
          class="flex items-center justify-between p-3 bg-100 rounded-lg"
      >
        <span class="text-normal">显示分钟</span>
        <tc-switch
            v-model="config.displayMinute"
            class="ml-2"

        ></tc-switch>
      </div>
      <div
          class="flex items-center justify-between p-3 bg-100 rounded-lg"
      >
        <span class="text-normal">显示秒</span>
        <tc-switch
            v-model="config.displaySecond"
            :disabled="isSecondDisabled"
            class="ml-2"

        ></tc-switch>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

