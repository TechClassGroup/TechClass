<script lang="ts" setup>
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <div class="flex-1 mr-4">
      <div class="text-base font-medium">
        {{ title }}
      </div>
      <div v-if="description" class="mt-1 text-sm text-normal">
        {{ description }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>

</style>
