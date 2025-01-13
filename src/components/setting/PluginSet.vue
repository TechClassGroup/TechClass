<script lang="ts" setup>
import {useApplicationStore} from "@/stores/useApplicationStore.ts";
import {officialPlugins} from "@/plugins/officialPlugins.ts";
import TcSwitch from "@/UI/TcSwitch.vue";
import TcButton from "@/UI/TcButton.vue";
import {init_plugins} from "@/modules/pluginsManager.ts";
import {watch} from "vue";
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
  <div class="p-3">
    <div class="flex">
      <h1 class="font-black mb-5">插件列表</h1>
      <tc-button
          v-if="store.setting.needReloadPlugins"
          @click="reload_plugins"
          class=" ml-auto mr-4 mb-2 text-sm"
      >
        立即重新加载
      </tc-button>
    </div>

    <template v-for="item in officialPlugins" :key="item.id">
      <div
          class="flex items-center justify-between p-4 border-t border-gray-500"
      >
        <div class="mr-4">
          <div class="text-base font-medium">
            {{ item.name }}
          </div>
          <div class="text-xs mt-1">
            {{ item.description }}
          </div>
        </div>
        <TcSwitch
            :model-value="store.storage.pluginsList.official.includes(item.id)"
            @update:model-value="(value) => togglePlugin(item.id, value)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
/**/
</style>
