<script setup lang="ts">
import {computed, nextTick, ref} from "vue";

interface Props {
  /**
   * 输入框标签文本
   */
  label?: string;

  /**
   * 输入框占位符文本
   */
  placeholder?: string;

  /**
   * 输入框类型
   * @default "text"
   */
  type?: string;

  /**
   * 输入框尺寸
   * @default "default"
   */
  size?: "small" | "default" | "large";

  /**
   * 是否禁用输入框
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否显示错误状态
   * @default false
   */
  error?: boolean;

  /**
   * 帮助文本或错误提示
   */
  helperText?: string;

  /**
   * 是否为必填项
   * @default false
   */
  required?: boolean;

  /**
   * 文本域行数，仅在 type="textarea" 时有效
   */
  rows?: number;

  /**
   * 自适应内容高度，仅对 type="textarea" 有效
   * 可传入对象，如 { minRows: 2, maxRows: 6 }
   */
  autosize?: boolean | { minRows?: number; maxRows?: number };
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  size: "default",
  disabled: false,
  error: false,
  required: false,
  rows: 2,
});

const model = defineModel<string>();
const textareaRef = ref<HTMLTextAreaElement>();

// 处理time类型的显示值
const displayValue = computed(() => {
  if (props.type === "time" && model.value) {
    const parts = model.value.split(":");
    if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
  }
  return model.value;
});

// 添加对time类型的特殊处理
const timeInputProps = computed(() => {
  if (props.type === "time") {
    return {
      step: 1,
      pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}",
    };
  }
  return {};
});

const sizeClasses = computed(() => ({
  "py-1 px-2 text-sm": props.size === "small",
  "px-4 py-2": props.size === "default",
  "px-4 py-3 text-lg": props.size === "large",
}));

const inputClasses = computed(() => ({
  ...sizeClasses.value,
  "border-red-500": props.error,
  "border-gray-300": !props.error,
  "hover:border-primary hover:shadow-sm": !props.disabled && !props.error,
  "focus:border-primary focus:ring-1 focus:ring-primary/20 focus:shadow":
      !props.disabled && !props.error,
  "bg-300 cursor-not-allowed": props.disabled,
  "bg-50": !props.disabled,
}));

// 自适应高度相关函数
const updateTextareaHeight = async () => {
  if (props.type !== "textarea" || !props.autosize || !textareaRef.value)
    return;

  await nextTick();
  const textarea = textareaRef.value;
  const minRows =
      typeof props.autosize === "object" ? props.autosize.minRows || 1 : 1;
  const maxRows =
      typeof props.autosize === "object"
          ? props.autosize.maxRows || Infinity
          : Infinity;

  textarea.style.height = "auto";
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
  const minHeight = minRows * lineHeight;
  const maxHeight = maxRows * lineHeight;

  const scrollHeight = textarea.scrollHeight;
  textarea.style.height = `${Math.min(
      Math.max(scrollHeight, minHeight),
      maxHeight
  )}px`;
};

// 监听值变化以更新高度
const handleInput = (e: Event) => {
  let value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;

  // 对time类型的输入进行特殊处理
  if (props.type === "time" && value.length === 5) {
    value = value + ":00";
  }

  model.value = value;
  if (props.type === "textarea" && props.autosize) {
    updateTextareaHeight();
  }
};
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-normal">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <textarea
        v-if="type === 'textarea'"
        ref="textareaRef"
        :class="inputClasses"
        :disabled="disabled"
        :placeholder="placeholder"
        :rows="rows"
        :value="model"
        class="rounded-lg border outline-none transition-all duration-300 ease-in-out w-full resize-none"
        @input="handleInput"
    />
    <input
        v-else
        :class="inputClasses"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="type"
        :value="displayValue"
        class="rounded-lg border outline-none transition-all duration-300 ease-in-out w-full"
        v-bind="timeInputProps"
        @input="handleInput"
    />

    <p
        v-if="helperText"
        :class="error ? 'text-red-500' : 'text-muted'"
        class="text-xs"
    >
      {{ helperText }}
    </p>
  </div>
</template>

<style scoped>
input::placeholder,
textarea::placeholder {
  transition: color 0.3s ease;
}

input:focus::placeholder,
textarea:focus::placeholder {
  color: #999;
}
</style>
