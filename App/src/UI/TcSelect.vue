<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {ChevronDown} from "lucide-vue-next";

interface Option {
  value: string | number;
  label: string;
}

interface Props {
  /**
   * 选择框标签文本
   */
  label?: string;

  /**
   * 选择框占位符文本
   */
  placeholder?: string;

  /**
   * 选择框选项
   */
  options: Option[];

  /**
   * 选择框尺寸
   * @default "default"
   */
  size?: "small" | "default" | "large";

  /**
   * 是否禁用选择框
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否为必填项
   * @default false
   */
  required?: boolean;

  /**
   * 当前选中的值（v-model）
   */
  modelValue?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  size: "default",
  disabled: false,
  required: false,
  options: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);
const isSelecting = ref(false);

// 获取选中项的标签
const selectedLabel = computed(() => {
  const selected = props.options.find(
      (option) => option.value === props.modelValue
  );
  return selected ? selected.label : "";
});

// 尺寸相关样式
const sizeClasses = computed(() => ({
  "py-1 px-2 text-sm": props.size === "small",
  "px-4 py-2": props.size === "default",
  "px-4 py-3 text-lg": props.size === "large",
}));

// 选择框样式
const selectClasses = computed(() => ({
  ...sizeClasses.value,
  "border-gray-300": true,
  "hover:border-primary hover:shadow-sm": !props.disabled,
  "focus:border-primary focus:ring-1 focus:ring-primary/20 focus:shadow":
      !props.disabled,
  "bg-300 cursor-not-allowed": props.disabled,
  "bg-50": !props.disabled,
}));

// 下拉选项样式
const optionClasses = computed(() => ({
  "py-1 px-2 text-sm": props.size === "small",
  "px-3 py-2": props.size === "default",
  "px-3 py-2.5 text-lg": props.size === "large",
}));

// 处理下拉框显示/隐藏
const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

// 关闭下拉框
const closeDropdown = () => {
  if (!isSelecting.value) {
    isOpen.value = false;
  }
};

// 选择选项
const selectOption = (option: Option) => {
  isSelecting.value = true;
  emit("update:modelValue", option.value);
  // 使用setTimeout确保在blur事件之后执行关闭操作
  setTimeout(() => {
    isOpen.value = false;
    isSelecting.value = false;
  }, 0);
};

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<template>
  <div ref="selectRef" class="relative">
    <div class="flex flex-col gap-1">
      <label v-if="label" class="text-sm font-medium text-normal">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>

      <button
          :class="selectClasses"
          :disabled="disabled"
          class="rounded-lg border outline-none transition-all duration-300 ease-in-out w-full text-left flex justify-between items-center"
          type="button"
          @click="toggleDropdown"
      >
        <span v-if="selectedLabel">{{ selectedLabel }}</span>
        <span v-else class="text-gray-400">{{ placeholder }}</span>
        <ChevronDown
            :class="{ 'rotate-180': isOpen }"
            class="w-4 h-4 transition-transform duration-200"
        />
      </button>
    </div>

    <div
        v-if="isOpen"
        class="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-auto"
    >
      <div
          v-for="option in options"
          :key="option.value"
          :class="[
                    optionClasses,
                    'cursor-pointer hover:bg-primary-100 transition-colors duration-150 text-center',
                    props.modelValue === option.value
                        ? 'bg-primary-50 text-primary'
                        : '',
                ]"
          @click="selectOption(option)"
          @mousedown.prevent
      >
        {{ option.label }}
      </div>
      <div
          v-if="options.length === 0"
          class="py-2 px-3 text-gray-500 text-center"
      >
        无选项可用
      </div>
    </div>
  </div>
</template>
