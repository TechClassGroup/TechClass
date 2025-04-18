<script lang="ts" setup>
import {useApplicationStore} from "../../stores/useApplicationStore";
import {officialPlugins} from "../../plugins/officialPlugins";
import TcSwitch from "../../UI/TcSwitch.vue";
import TcButton from "../../UI/TcButton.vue";
import {init_plugins} from "../../core/plugins-systems/pluginsManager";
// 数据流动: 按钮更新 --> store变化 --> 按钮状态变化
const store = useApplicationStore();

// 切换插件状态
const togglePlugin = (pluginId: string, value: boolean) => {
  if (value) {
    // 添加到官方列表
    store.storage.pluginsList.official.push(pluginId);
  } else {
    // 从官方列表中移除
    const index = store.storage.pluginsList.official.indexOf(pluginId);
    if (index > -1) {
      store.storage.pluginsList.official.splice(index, 1);
    }
  }
};
const reload_plugins = () => {
  init_plugins();
  store.reloadPlugins();
};
</script>

<template>
  <div class="p-2">
    <div class="flex items-center mb-6">
      <h1 class="text-2xl font-medium leading-8">插件列表</h1>
      <Transition
          enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          enter-from-class="transform scale-90 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-90 opacity-0"
      >
        <tc-button
            v-if="store.setting.needReloadPlugins"
            @click="reload_plugins"
            class="ml-auto h-8"
        >
          立即重新加载
        </tc-button>
      </Transition>
    </div>

    <div class="space-y-3">
      <div
          v-for="item in officialPlugins"
          :key="item.id"
          class="bg-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
      >
        <div class="flex items-center justify-between p-4">
          <div class="flex-1 mr-4">
            <div class="text-base font-medium">
              {{ item.name }}
            </div>
            <div class="mt-1 text-sm text-muted">
              {{ item.description }}
            </div>
          </div>
          <TcSwitch
              :model-value="
                            store.storage.pluginsList.official.includes(item.id)
                        "
              @update:model-value="
                            (value) => togglePlugin(item.id, value)
                        "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/** */
</style>
