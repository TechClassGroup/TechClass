<script lang="ts" setup>

import {computed, defineComponent, Ref} from "vue";
import {appInstance} from "../core/plugins-systems/appInstance";
import {draggableComponentStatus} from "../core/plugins-systems/types/component.type";

const updateComponentStatus = (
    status: draggableComponentStatus,
    left: number | "auto",
    top: number | "auto",
    width: number,
    height: number
) => {

  if (left !== undefined) status.x = left as any;
  if (top !== undefined) status.y = top as any;
  if (width !== undefined) status.width = width as any;
  if (height !== undefined) {
    status.height = height as any;
  }
};
const onResizeDrag = ($event: any, status: draggableComponentStatus) => {

  updateComponentStatus(status, $event[0], $event[1], $event[2], $event[3]);
};

const getComponentProps = (componentStatus: draggableComponentStatus) => {
  return computed(() => {
    const status = componentStatus
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
  }).value;
};

interface componentItem {
  id: string;
  component: ReturnType<typeof defineComponent>
  status: Ref<draggableComponentStatus>
}

const computedComponents = computed<componentItem[]>(() => {
  const components: componentItem[] = [];
  Object.keys(appInstance.plugins.value).forEach((pluginKey) => {
    const plugin = appInstance.plugins.value[pluginKey];
    if (Object.keys(plugin.componentStatus.mainPage).length < 0) {
      return;
    }

    Object.keys(plugin.componentStatus.mainPage).forEach((componentKey) => {
      components.push(
          {
            id: `${pluginKey}-${componentKey}`,
            component: plugin.componentStatus.mainPage[componentKey].component,
            status: plugin.componentStatus.mainPage[componentKey].status
          }
      )
    })

  })
  return components
})
</script>

<template>

  <div class="bg-300 relative min-h-full p-4">
    <template v-for="item in computedComponents" :key="item.id">

      <vue-draggable-resizable
          :parent="true"
          class="shadow-md rounded-lg bg-50"
          v-bind="getComponentProps(item.status as unknown as draggableComponentStatus)"
          @dragging="(...$event: any) => onResizeDrag($event, item.status as unknown as draggableComponentStatus)"
          @resizing="(...$event: any) => onResizeDrag($event, item.status as unknown as draggableComponentStatus)"
      >
        <component
            :is="item.component"
            class="p-2"
        ></component>
        <div>
          {{ item.status }}
        </div>
      </vue-draggable-resizable>
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
