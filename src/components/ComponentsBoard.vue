<script setup lang="ts">


import {computedPluginsComponent, loadNewPlugin} from "../modules/plugins_manager.ts";
import timeDisplay from "../plugins/timeDisplay/timeDisplay.ts";
</script>

<template>
  <div class="bg-lime-300 ">
    <button @click="loadNewPlugin(timeDisplay)">load it!</button>
    <template v-for="item in computedPluginsComponent">
      <component :is="item.component.main_page" :store="item.store"></component>
    </template>
  </div>
</template>

<style scoped>

</style>