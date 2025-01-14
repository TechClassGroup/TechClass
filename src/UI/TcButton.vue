<script lang="ts" setup>
import {computed} from "vue";

interface Props {
  /**
   * 按钮类型
   * @default "filled"
   * @values
   * - filled: 填充按钮，用于主要操作
   * - tonal: 色调按钮，用于次要操作
   * - outlined: 描边按钮，用于次要操作
   * - text: 文本按钮，用于最低优先级操作
   * - elevated: 悬浮按钮，带阴影效果
   */
  variant?: "filled" | "tonal" | "outlined" | "text" | "elevated";

  /**
   * 按钮尺寸
   * @default "medium"
   * @values
   * - small: 小型按钮 (24px)
   * - medium: 中型按钮 (32px)
   * - large: 大型按钮 (40px)
   */
  size?: "small" | "medium" | "large";

  /**
   * 是否禁用按钮
   * @default false
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "filled",
  size: "medium",
  disabled: false,
});

// 基础样式类
const baseClasses = [
  "rounded-md font-medium transition-all duration-200 ease-in-out",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  props.disabled
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "cursor-pointer",
];

// 尺寸类
const sizeClasses = {
  small: "px-3 py-1 text-sm",
  medium: "px-4 py-2 text-sm",
  large: "px-6 py-3 text-base",
};

// 颜色映射
const colorClasses = {
  filled: "bg-[#0078D4] text-white hover:bg-[#006CBE] active:bg-[#005BA1]",
  tonal: "bg-[#EFF6FC] text-[#0078D4] hover:bg-[#DEECF9] active:bg-[#C7E0F4]",
  outlined:
      "border-2 border-[#0078D4] text-[#0078D4] hover:bg-[#EFF6FC] active:bg-[#DEECF9]",
  text: "text-[#0078D4] hover:bg-[#EFF6FC] active:bg-[#DEECF9]",
  elevated:
      "bg-white text-[#0078D4] shadow-md hover:shadow-lg hover:bg-[#EFF6FC] active:bg-[#DEECF9]",
};

// 计算最终的类名
const buttonClasses = computed(() => [
  ...baseClasses,
  sizeClasses[props.size],
  colorClasses[props.variant],
  props.variant === "text" ? "px-2" : "", // text variant 的特殊处理
  "active:scale-[0.98]", // 点击效果
]);
</script>

<template>
  <button :class="buttonClasses" :disabled="props.disabled">
    <slot></slot>
  </button>
</template>

<style scoped>
button:focus-visible {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}
</style>
