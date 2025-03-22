<script lang="ts" setup></script>

<template>
    <div class="flex flex-col items-center justify-center h-full">
        <div class="text-center space-y-6">
            <!-- Material Design 风格的开发中提示 -->
            <div class="flex flex-col items-center space-y-4 mb-8">
                <div
                    class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
                >
                    <div
                        class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                    ></div>
                </div>

              <h2 class="text-2xl font-medium text-title">开发进行中</h2>
              <p class="text-normal">你来的真早！但是还没写完</p>
            </div>

          <div class="max-w-lg mx-auto mt-8 space-y-4 text-normal">
                <p>
                    这是一个基于 Tauri + Vue3 + TypeScript 开发的现代化桌面应用
                </p>
                <div class="flex flex-wrap justify-center gap-2 text-sm">
                    <span class="px-3 py-1 bg-300 rounded-full"
                        >Tauri</span
                    >
                  <span class="px-3 py-1 bg-300 rounded-full"
                        >Vue 3</span
                    >
                  <span class="px-3 py-1 bg-300 rounded-full"
                        >TypeScript</span
                    >
                  <span class="px-3 py-1 bg-300 rounded-full"
                        >Tailwind CSS</span
                    >
                  <span class="px-3 py-1 bg-300 rounded-full"
                        >Pinia</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
