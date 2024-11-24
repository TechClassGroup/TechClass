<script setup lang="ts">

import logger from "../modules/logger.ts";
import {onMounted} from "vue";

import {useRouter} from "vue-router";
import {useApplicationStore} from "../stores/useApplicationStore.ts";

const router = useRouter()
const basic_url = "/setting";
const store = useApplicationStore();

function changePage(target: string) {
  logger.info(`Change Current Page to ${target}`);
  const target_url = `${basic_url}/${target}`;
  if (router.hasRoute(target_url)) {
    store.setting.current_page = target_url;
    router.push(target_url);
    return
  }
  store.resetSettingCurrentPage();
  router.push(`${basic_url}/${store.setting.current_page}`);
}

onMounted(() => {
  logger.info("Setting Page Mounted");
  changePage(store.setting.current_page)
})
</script>

<template>
  <div class="fixed  top-0 left-0 w-full h-full flex justify-center items-center">

    <div class="relative z-50 w-[1200px] max-h-[90vh] h-[800px]  p-1 max-w-[70vw] bg-blue-200 rounded-xl flex overflow-hidden ">
      <button class="absolute top-1 right-1 m-2" @click="store.reverseSettingOpen()">
        <img src="/src/assets/images/web-window-close.svg" alt="关闭窗口">
      </button>
      <div class="basis-1/4 min-w-44 max-w-64 p-3 bg-blue-300 rounded overflow-y-auto">
        <button @click="changePage('general/about')">关于</button>
      </div>
      <div class="bg-blue-500 flex-grow p-3 rounded ml-1">
        <router-view></router-view>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>