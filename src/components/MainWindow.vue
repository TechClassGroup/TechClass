<script setup lang="ts">

import SideDock from "./SideDock.vue";
import ComponentsBoard from "./ComponentsBoard.vue";
import {useApplicationStore} from "../stores/useApplicationStore.ts";
import SettingPage from "./SettingPage.vue";


const store = useApplicationStore()

</script>

<template>

  <div class="fixed">
    <setting-page v-if="store.setting.open"></setting-page>
  </div>


  <div class="w-full h-full flex flex-row">
    <side-dock></side-dock>
    <components-board class="flex-grow"></components-board>
  </div>


</template>

<style scoped>

</style>