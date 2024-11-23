<script setup lang="ts">

import SideDock from "./SideDock.vue";
import ComponentsBoard from "./ComponentsBoard.vue";
</script>

<template>
  <div class="w-full h-full flex flex-row">
    <side-dock></side-dock>
    <components-board class="flex-grow"></components-board>
  </div>
</template>

<style scoped>

</style>