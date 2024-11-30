<script setup lang="ts">


import {loadNewPlugin} from "../modules/plugins_manager.ts";
import timeDisplay from "../plugins/timeDisplay/timeDisplay.ts";
</script>

<template>
  <div class="bg-lime-300 -z-10">
    <button @click="loadNewPlugin(timeDisplay)">load it!</button>
  </div>
</template>

<style scoped>

</style>