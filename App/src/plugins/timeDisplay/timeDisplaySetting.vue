<script setup lang="ts">
import {PluginProps} from "../../types/plugins.types";
import TcSwitch from "../../UI/TcSwitch.vue";
import {computed, watch} from "vue";

const props = defineProps<PluginProps>();
const store = props.store;

const isSecondDisabled = computed(() => {
  return (
      (store.storage.displayHour && !store.storage.displayMinute) ||
      !store.storage.displayMinute
  );
});

watch(isSecondDisabled, (newValue) => {
  if (newValue) {
    store.storage.displaySecond = false;
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
            v-model="store.storage.displayHour"
            class="ml-2"
            :class="{
                        'bg-blue-500': store.storage.displayHour,
                        'bg-700': !store.storage.displayHour,
                    }"
        ></tc-switch>
      </div>
      <div
          class="flex items-center justify-between p-3 bg-100 rounded-lg"
      >
        <span class="text-normal">显示分钟</span>
        <tc-switch
            v-model="store.storage.displayMinute"
            class="ml-2"
            :class="{
                        'bg-blue-500': store.storage.displayMinute,
                        'bg-700': !store.storage.displayMinute,
                    }"
        ></tc-switch>
      </div>
      <div
          class="flex items-center justify-between p-3 bg-100 rounded-lg"
      >
        <span class="text-normal">显示秒</span>
        <tc-switch
            v-model="store.storage.displaySecond"
            :disabled="isSecondDisabled"
            class="ml-2"
            :class="{
                        'bg-blue-500': store.storage.displaySecond,
                        'bg-700': !store.storage.displaySecond,
                    }"
        ></tc-switch>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

