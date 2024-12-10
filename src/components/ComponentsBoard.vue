<script lang="ts" setup>


import {computedPluginsComponent} from "../modules/plugins_manager.ts";
</script>

<template>

  <div class="bg-lime-300 relative">

    <template v-for="item in computedPluginsComponent" :key="item">
      <vue-draggable-resizable
          :parent="true"
          :z="1"

      >
        <component :is="item.component.main_page" :store="item.store"></component>
      </vue-draggable-resizable>

    </template>
  </div>
</template>

<style scoped>

</style>