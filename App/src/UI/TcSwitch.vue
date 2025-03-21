<script lang="ts" setup>
import {computed} from "vue";

interface Props {
  disabled?: boolean;
  /**
   * 开关尺寸
   * @default "medium"
   * @values
   * - small: 小型开关 (24px)
   * - medium: 中型开关 (32px)
   * - large: 大型开关 (40px)
   */
  size?: "small" | "medium" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: "medium",
});

const model = defineModel<boolean>({default: false});

// 处理开关状态变化
const toggleSwitch = () => {
  if (!props.disabled) {
    model.value = !model.value;
  }
};

// 尺寸映射
const sizeClasses = {
  small: {
    switch: "h-4 w-8",
    thumb: "h-3 w-3",
    translate: "translate-x-4",
  },
  medium: {
    switch: "h-6 w-11",
    thumb: "h-4 w-4",
    translate: "translate-x-6",
  },
  large: {
    switch: "h-8 w-14",
    thumb: "h-6 w-6",
    translate: "translate-x-7",
  },
};

// 计算属性
const switchClasses = computed(() => [
  "group relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out",
  model.value ? "bg-primary" : "bg-gray-200",
  props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
  sizeClasses[props.size].switch,
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
]);

const thumbClasses = computed(() => [
  "inline-block transform rounded-full bg-white transition-all duration-200 ease-in-out",
  sizeClasses[props.size].thumb,
  model.value
      ? [sizeClasses[props.size].translate, "shadow-md"]
      : "translate-x-1 shadow",
  "hover:shadow-lg",
  "group-active:w-[1.25em]",
  model.value ? "group-active:ml-[-0.25rem]" : "group-active:ml-[0.25rem]",
]);
</script>

<template>
  <button
      type="button"
      :class="switchClasses"
      :disabled="disabled"
      @click="toggleSwitch"
  >
    <span :class="thumbClasses" />
  </button>
</template>
