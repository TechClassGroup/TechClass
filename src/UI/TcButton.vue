<script setup lang="ts">
interface Props {
  disabled: boolean
}

const {disabled = false} = defineProps<Props>()
</script>

<template>
  <button :class="disabled? 'absolute' : 'break-words'" >
    <slot></slot>
  </button>
</template>

<style scoped>

</style>