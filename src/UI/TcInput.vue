<script setup lang="ts">
import { computed } from "vue";

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
}

const props = withDefaults(defineProps<Props>(), {
    type: "text",
    disabled: false,
    error: false,
    required: false,
});

const model = defineModel();

const inputClasses = computed(() => ({
    "border-red-500": props.error,
    "border-gray-300": !props.error,
    "hover:border-[#0078D4] hover:shadow-sm": !props.disabled && !props.error,
    "focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4]/20 focus:shadow":
        !props.disabled && !props.error,
    "bg-gray-100 cursor-not-allowed": props.disabled,
    "bg-white": !props.disabled,
}));
</script>

<template>
    <div class="flex flex-col gap-1">
        <label v-if="label" class="text-sm font-medium text-gray-700">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <input
            :value="model"
            @input="e => model = (e.target as HTMLInputElement).value"
            :type="type"
            :disabled="disabled"
            :placeholder="placeholder"
            class="px-4 py-2 rounded-lg border outline-none transition-all duration-300 ease-in-out w-full"
            :class="inputClasses"
        />

        <p
            v-if="helperText"
            class="text-xs"
            :class="error ? 'text-red-500' : 'text-gray-500'"
        >
            {{ helperText }}
        </p>
    </div>
</template>

<style scoped>
input::placeholder {
    transition: color 0.3s ease;
}

input:focus::placeholder {
    color: #999;
}
</style>
