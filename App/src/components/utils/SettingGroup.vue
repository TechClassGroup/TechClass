<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<template>
  <div
      class="bg-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out mb-4"
  >
    <div class="p-4">
      <h2 class="text-lg font-medium mb-2">{{ title }}</h2>
      <div class="space-y-2">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
