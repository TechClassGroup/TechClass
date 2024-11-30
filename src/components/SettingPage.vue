<script setup lang="ts">

import logger from "../modules/logger.ts";
import {useApplicationStore} from "../stores/useApplicationStore.ts";
import About from "./setting/About.vue";
import {Component} from "vue";


const store = useApplicationStore();

interface Route {
  name: string;
  component: Component;
}

const routes: { [key: string]: Route } = {
  about: {
    name: "关于",
    component: About,
  }
}

function changePage(target: string) {
  logger.debug(`设置页面: 修改当前页面到 ${target}`);
  if (!routes[target]) {
    logger.warn(`设置页面: 未找到 ${target} 页面`);
    store.resetSettingCurrentPage();
  } else {
    store.setting.current_page = target;
  }
}


</script>

<template>
  <div class="fixed  top-0 left-0 w-full h-full flex justify-center items-center">

    <div
        class="relative z-50 w-[1200px] max-h-[90vh] h-[800px]  p-1 max-w-[70vw] bg-blue-200 rounded-xl flex overflow-hidden ">
      <button class="absolute top-1 right-1 m-2" @click="store.reverseSettingOpen()">
        <img src="/src/assets/images/web-window-close.svg" alt="关闭窗口">
      </button>
      <template v-for="(value,key) in routes">
        <div class="basis-1/4 min-w-44 max-w-64 p-3 bg-blue-300 rounded overflow-y-auto">
          <button @click="changePage(String(key))">{{ value.name}}</button>
        </div>
      </template>

      <div class="bg-blue-500 flex-grow p-3 rounded ml-1">
        <component :is="routes[store.setting.current_page].component" />
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>