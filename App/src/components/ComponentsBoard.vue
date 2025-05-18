<script lang="ts" setup>
import {appInstance} from "../core/plugins-systems/appInstance";

import {draggableComponentStatus} from "../core/plugins-systems/types/components/base";

const updateComponentStatus = (
    status: draggableComponentStatus,
    left: number,
    top: number,
    width: number | "auto",
    height: number | "auto"
) => {
  if (left !== undefined) status.x = left
  if (top !== undefined) status.y = top
  if (width !== undefined) status.width = width
  if (height !== undefined) {
    status.height = height
  }
};
const onResizeDrag = ($event, status: draggableComponentStatus) => {
  updateComponentStatus(status, $event[0], $event[1], $event[2], $event[3]);
};

const getComponentProps = (componentStatus: draggableComponentStatus) => {
  const status = componentStatus;
  return {
    maxWidth: status.maxWidth,
    maxHeight: status.maxHeight,
    minWidth: status.minWidth,
    minHeight: status.minHeight,
    w: status.width,
    h: status.height,
    x: status.x,
    y: status.y,
    draggable: status.draggable,
    resizable: status.resizable,
    z: status.zIndex,
  }
};
</script>

<template>
  <div class="bg-300 relative min-h-full p-4">
    <template
        v-for="(plugin, pluginKey) in appInstance.plugins.value"
        :key="pluginKey"
    >
      <template
          v-for="(componentInfo, componentKey) in plugin.componentStatus
                    .mainBoardManager.components"
          :key="`${pluginKey}-${componentKey}`"
      >
        <vue-draggable-resizable
            :parent="true"
            class="shadow-md rounded-lg bg-50"
            v-bind="getComponentProps(componentInfo.status as unknown as draggableComponentStatus)"
            @dragging="(...$event: any) => onResizeDrag($event, componentInfo.status as unknown as draggableComponentStatus)"
            @resizing="(...$event: any) => onResizeDrag($event, componentInfo.status as unknown as draggableComponentStatus)"
        >
          <component
              :is="componentInfo.component"
              :plugin="plugin"
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
