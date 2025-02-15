<script setup lang="ts">
import {PluginProps} from "../../types/plugins";
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
  <div class="p-4 bg-white rounded-lg shadow-md">
    <div class="space-y-4">
      <div
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <span class="text-gray-700">显示小时</span>
        <tc-switch
            v-model="store.storage.displayHour"
            class="ml-2"
            :class="{
                        'bg-blue-500': store.storage.displayHour,
                        'bg-gray-300': !store.storage.displayHour,
                    }"
        ></tc-switch>
      </div>
      <div
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <span class="text-gray-700">显示分钟</span>
        <tc-switch
            v-model="store.storage.displayMinute"
            class="ml-2"
            :class="{
                        'bg-blue-500': store.storage.displayMinute,
                        'bg-gray-300': !store.storage.displayMinute,
                    }"
        ></tc-switch>
      </div>
      <div
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <span class="text-gray-700">显示秒</span>
        <tc-switch
            v-model="store.storage.displaySecond"
            :disabled="isSecondDisabled"
            class="ml-2"
            :class="{
                        'bg-blue-500': store.storage.displaySecond,
                        'bg-gray-300': !store.storage.displaySecond,
                    }"
        ></tc-switch>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

