<script lang="ts" setup>
// 移除 props 定义，不再需要
</script>

<template>
  <div
      class="bg-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out mb-4"
  >
    <div class="p-4">
      <h2 class="text-lg font-medium mb-2">
        <slot name="title">默认标题</slot>
      </h2>
      <div class="space-y-2">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
