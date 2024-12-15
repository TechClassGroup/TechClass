<script lang="ts" setup>
interface Props {
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});
</script>

<template>
  <button
    :class="[
      'px-4 py-2 rounded-md font-medium text-sm bg-[#0078D4] text-white',
      'transition-all duration-200 ease-in-out shadow-sm hover:shadow-md',
      'hover:bg-[#005A9E] active:bg-[#004578] active:scale-[0.98]',
      props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
    ]"
    :disabled="props.disabled"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
button:focus-visible {
  outline: 2px solid #0078D4;
  outline-offset: 2px;
}
</style>
