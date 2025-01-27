<script lang="ts" setup>

import SideDock from "./SideDock.vue";
import ComponentsBoard from "./ComponentsBoard.vue";

import SettingPage from "./SettingPage.vue";
import {useApplicationStore} from "../stores/useApplicationStore";
import markdownContent from "@docs/README.md"

const store = useApplicationStore();

</script>

<template>

  <div class="fixed z-50">
    <setting-page v-if="store.setting.open"></setting-page>
  </div>


  <div class="w-full h-full flex flex-row">
    <side-dock></side-dock>
    <components-board class="flex-grow overflow-hidden"></components-board>
  </div>
  <markdownContent></markdownContent>


</template>

<style scoped>

</style>