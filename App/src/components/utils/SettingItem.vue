<script lang="ts" setup>
// 移除 props 定义，不再需要
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <div class="flex-1 mr-4">
      <div class="text-title">
        <slot name="title">默认标题</slot>
      </div>
      <div class="mt-1 text-xs text-muted">
        <slot name="description"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped></style>
