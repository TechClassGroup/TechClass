<script lang="ts" setup>
interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})
</script>

<template>
  <button
      :class="props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[#005A9E]'"
      :disabled="props.disabled"
      class="p-2 bg-[#0078D4] text-white rounded shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition duration-200 ease-in-out"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
</style>