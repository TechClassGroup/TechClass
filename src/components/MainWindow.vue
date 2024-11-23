<script setup lang="ts">

import SideDock from "./SideDock.vue";
import ComponentsBoard from "./ComponentsBoard.vue";
import SettingPage from "./SettingPage.vue";
</script>

<template>
  <div class="fixed top-0 left-0 w-full h-full flex justify-center items-center" >
    <setting-page></setting-page>
  </div>


  <div class="w-full h-full flex flex-row">
    <side-dock></side-dock>
    <components-board class="flex-grow"></components-board>
  </div>


</template>

<style scoped>

</style>