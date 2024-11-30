<script setup lang="ts">

import TcButton from "../UI/TcButton.vue";
import {loadNewPlugin} from "../modules/plugins_manager.ts";
import timeDisplay from "../plugins/timeDisplay/timeDisplay.ts";
</script>

<template>
  <div class="bg-lime-300 -z-10">
    <tc-button @click="loadNewPlugin(timeDisplay)">load it!</tc-button>
  </div>
</template>

<style scoped>

</style>