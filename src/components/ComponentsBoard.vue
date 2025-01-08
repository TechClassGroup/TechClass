<script lang="ts" setup>
import {DraggableComponentConfig} from "@/types/plugins.js";
import {computedPluginsComponent} from "../modules/plugins_manager.ts";

const updateComponentStatus = (
    status: DraggableComponentConfig,
    left: number | "auto",
    top: number | "auto",
    width: number,
    height: number
) => {
  status.x = left as any;
  status.y = top as any;
  status.width = width as any;
  status.height = height as any;
};
const onResizeDrag = ($event: any, status: DraggableComponentConfig) => {
  updateComponentStatus(
      status,
      $event[0],
      $event[1],
      $event[2],
      $event[3]
  );
};
</script>

<template>
  <div class="bg-gray-100 relative min-h-full p-4">
    <template v-for="item in computedPluginsComponent" :key="item.id">
      <template
          v-for="(component, key) in item.component.mainPage"
          :key="`${item.id}-${key}`"
      >
        <vue-draggable-resizable
            :parent="true"
            class="shadow-md rounded-lg bg-white"
            :max-width="item.store.componentStatus[key].width"
            :max-height="item.store.componentStatus[key].height"
            :min-width="item.store.componentStatus[key].minWidth"
            :min-height="item.store.componentStatus[key].minHeight"
            :width="item.store.componentStatus[key].width"
            :height="item.store.componentStatus[key].height"
            :x="item.store.componentStatus[key].x"
            :y="item.store.componentStatus[key].y"
            :draggable="item.store.componentStatus[key].draggable"
            :resizable="item.store.componentStatus[key].resizable"
            :z="item.store.componentStatus[key].zIndex"

            @resizing="(...$event: any) => onResizeDrag($event, item.store.componentStatus[key])"
            @dragging="(...$event: any) => onResizeDrag($event, item.store.componentStatus[key])"
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
