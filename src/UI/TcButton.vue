<script setup lang="ts">


interface Props {
  disabled?: boolean
}
// @ts-ignore
const props = withDefaults(defineProps<Props>(), {
  disabled: false
})
</script>

<template>
  <button class="p-1 ">
    <slot></slot>
  </button>
</template>

<style scoped>
/* Add your styles here */
</style>