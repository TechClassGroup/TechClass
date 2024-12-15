<script lang="ts" setup>
interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const model = defineModel<boolean>({ default: false })

// 处理开关状态变化
const toggleSwitch = () => {
  if (!props.disabled) {
    model.value = !model.value
  }
}
</script>

<template>
  <button
    type="button"
    :class="[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out',
      model ? 'bg-[#0078D4]' : 'bg-gray-200',
      props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @click="toggleSwitch"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-md',
        model ? 'translate-x-6' : 'translate-x-1'
      ]"
    />
  </button>
</template>

<style scoped>
button:focus {
  outline: 2px solid #0078D4;
  outline-offset: 2px;
}

button:active span {
  width: 1.25rem;
}
</style>