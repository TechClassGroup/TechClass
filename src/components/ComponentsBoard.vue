<script lang="ts" setup>
import {computedPluginsComponent} from "../modules/plugins_manager.ts";
</script>

<template>
  <div class="bg-gray-100 relative min-h-full p-4">
    <template v-for="item in computedPluginsComponent" :key="item.id">
      <template v-for="(component, key) in item.component.main_page" :key="`${item.id}-${key}`">
        <vue-draggable-resizable
            :parent="true"
            :z="1"
            class="shadow-md rounded-lg bg-white"
        >
          <component
              :is="component"
              :store="item.store"
              class="p-2"
          ></component>
        </vue-draggable-resizable>
      </template>
    </template>
  </div>
</template>

<style scoped>
:deep(.vdr) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
}

:deep(.vdr-handle) {
  background-color: #9ca3af;
  border: 1px solid #6b7280;
}

:deep(.vdr-handle:hover) {
  background-color: #6b7280;
}
</style>
