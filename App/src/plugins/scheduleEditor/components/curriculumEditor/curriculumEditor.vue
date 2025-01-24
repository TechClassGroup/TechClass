<script setup lang="ts"></script>

<template>
    <div class="flex gap-4 h-[100%]">
        <!-- 左侧面板 -->
        <div class="w-1/4 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg">
                <div class="p-2 flex gap-2 border-b border-gray-200">
                    <div class="text-lg font-medium text-center">左侧面板</div>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <!-- 左侧内容区域 -->123
            </div>
        </div>

        <!-- 中间面板 -->
        <div class="flex-1 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg">
                <div class="p-2 flex gap-2 border-b border-gray-200">
                    <div class="text-lg font-medium text-center">中间面板</div>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <!-- 中间内容区域 -->123
            </div>
        </div>

        <!-- 右侧面板 -->
        <div class="w-1/4 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-lg">
                <div class="p-2 flex gap-2 border-b border-gray-200">
                    <div class="text-lg font-medium text-center">右侧面板</div>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <!-- 右侧内容区域 -->123
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 可以在这里添加额外的样式 */
</style>
