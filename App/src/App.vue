<script lang="ts" setup>
import MainWindow from "./components/MainWindow.vue";
import {computed} from "vue";
import {Theme, useApplicationStore} from "./stores/useApplicationStore";
import {userPreferDarkMode} from "./core/utils/utils";

const applicationStore = useApplicationStore();
const isDarkMode = computed<boolean>(() => {
  if (applicationStore.storage.appearance.theme === Theme.dark) {
    return true;
  }
  if (applicationStore.storage.appearance.theme === Theme.light) {
    return false;
  }
  return userPreferDarkMode.value;
});
</script>

<template>
  <div :class="isDarkMode ? 'dark' :''">
    <main-window></main-window>
  </div>
</template>

<style scoped></style>
