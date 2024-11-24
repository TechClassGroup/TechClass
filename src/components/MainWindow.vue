<script setup lang="ts">

import SideDock from "./SideDock.vue";
import ComponentsBoard from "./ComponentsBoard.vue";
</script>

<template>

  <div class="fixed">
    <router-view></router-view>
  </div>


  <div class="w-full h-full flex flex-row">
    <side-dock></side-dock>
    <router-link to="/setting" >to setting</router-link>

    <router-link to="/" class="z-50">Close Setting</router-link>
    <components-board class="flex-grow"></components-board>
  </div>


</template>

<style scoped>

</style>