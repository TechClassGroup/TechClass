<script lang="ts" setup>
import logger from "../modules/logger.ts";
import {useApplicationStore} from "../stores/useApplicationStore.ts";
import About from "./setting/About.vue";
import {defineComponent} from "vue";
import PluginSet from "@components/setting/PluginSet.vue";
import TcButton from "@/UI/TcButton.vue";

const store = useApplicationStore();

interface Route {
  name: string;
  component: ReturnType<typeof defineComponent>;
}

const routes: { [key: string]: Route } = {
  about: {
    name: "关于",
    component: About,
  },
  plugin: {
    name: "插件配置",
    component: PluginSet,
  },
};

function changePage(target: string) {
  logger.trace(`设置页面: 修改当前页面到 ${target}`);
  if (!routes[target]) {
    logger.warn(`设置页面: 未找到 ${target} 页面`);
    store.resetSettingCurrentPage();
  } else {
    store.setting.current_page = target;
  }
}
</script>

<template>
  <div
      :class="store.setting.open ? 'z-50' : '-z-50'"
      class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/30"
  >
    <div
        class="relative w-[1200px] max-h-[90vh] h-[800px] p-1 max-w-[70vw] bg-gray-100 rounded-xl flex overflow-hidden shadow-xl"
    >
      <button
          class="absolute top-1 right-1 m-2 hover:bg-gray-200 p-1 rounded-full transition-colors"
          @click="store.reverseSettingOpen()"
      >
        <img alt="关闭窗口" src="@assets/images/web-window-close.svg" />
      </button>

      <div
          class="basis-1/4 min-w-44 max-w-64 p-3 bg-gray-200 rounded overflow-y-auto flex-col flex gap-2">
        <template v-for="(value,key) in routes">
          <tc-button @click="changePage(String(key))"
                     class="text-gray-900 hover:bg-gray-300 bg-gray-200">
            {{ value.name }}
          </tc-button>
        </template>
      </div>

      <div class="bg-gray-100 flex-grow p-3 rounded ml-1">
        <component :is="routes[store.setting.current_page].component" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
