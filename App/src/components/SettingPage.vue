<script lang="ts" setup>
import logger from "../core/utils/logger";
import {useApplicationStore} from "../stores/useApplicationStore";
import About from "./setting/About.vue";
import {computed, defineComponent, markRaw, watch} from "vue";
import PluginSetting from "./setting/PluginSetting.vue";
import officialPluginsList from "../core/plugins-systems/officialPlugins"
import {CircleX} from "lucide-vue-next";
import Appearance from "./setting/Appearance.vue";
import {appInstance} from "../core/plugins-systems/appInstance";
import {Plugin} from "../core/plugins-systems/types/plugin.type";

const store = useApplicationStore();

interface Route {
  [key: string]: {
    name: string;
    component: ReturnType<typeof defineComponent>;
    plugin?: Plugin;
  };
}

const officialPlugins = computed<Route>(() => {
  const officialKeys = officialPluginsList.map((plugin) => plugin.manifest.id);
  const pluginList = Object.keys(appInstance.plugins.value)
      .filter((key) => {
        const plugin: Plugin = appInstance.plugins.value[key];
        return plugin.componentStatus.settingPageManager.component !== null;
      })

  const result: Route = {};
  pluginList.forEach((key) => {
    const plugin: Plugin = appInstance.plugins.value[key];
    result[`official-plugin-${plugin.manifest.id}`] = {
      name: plugin.manifest.name,
      component: plugin.componentStatus.settingPageManager.component.component,
      plugin: plugin,
    }
  })
  return result
});

const baseRoutes: Route = {
  about: {
    name: "关于",
    component: markRaw(About),
  },
  appearance: {
    name: "外观",
    component: markRaw(Appearance)
  },
  plugin: {
    name: "插件配置",
    component: markRaw(PluginSetting),
  },
};

const routes = computed<Route>(() => {
  return {
    ...baseRoutes,
    ...officialPlugins.value,
  };
});

function changePage(target: string) {
  logger.trace(`设置页面: 修改当前页面到 ${target}`);

  if (!routes.value[target]) {
    logger.warn(`设置页面: 未找到 ${target} 页面`);
    store.resetSettingCurrentPage();
  } else {
    store.setting.current_page = target;
  }
}

watch(
    officialPlugins,
    () => {
      if (!routes.value[store.setting.current_page]) {
        logger.warn(
            `设置页面: 插件变更，当前页面 ${store.setting.current_page} 不存在，重置到about页面`
        );
        store.resetSettingCurrentPage();
      }
    },
    {immediate: true}
);
</script>

<template>
  <div
      :class="store.setting.open ? 'z-50 opacity-100' : '-z-50 opacity-0'"
      class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/30 transition-all duration-300"
      @click.self="store.reverseSettingOpen()"
  >
    <div
        :class="store.setting.open ? 'scale-100' : 'scale-95'"
        class="relative w-[1200px] max-h-[90vh] h-[800px] p-1 max-w-[70vw] bg-300 rounded-xl flex overflow-hidden shadow-2xl transform transition-transform duration-300"
    >
      <button
          class="absolute top-1 right-1 m-2 w-8 h-8 hover:bg-500 rounded-full transition-all duration-200 flex items-center justify-center"
          @click="store.reverseSettingOpen()"
      >
        <CircleX />
      </button>

      <div
          class="w-1/4 max-w-52  p-3 bg-500/70 backdrop-blur-sm rounded-lg overflow-y-auto flex-col flex gap-1 m-1"
      >
        <!-- 基础设置组 -->
        <TransitionGroup class="flex flex-col gap-1" tag="div">
          <template v-for="(value, key) in baseRoutes" :key="key">
            <div
                :class="[
                                store.setting.current_page === key
                                    ? 'text-primary bg-primary/10 shadow-sm'
                                    : 'text-normal hover:bg-700/50 hover:translate-x-1',
                            ]"
                class="relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                @click="changePage(String(key))"
            >
              <div
                  v-if="store.setting.current_page === key"
                  class="absolute left-0 top-[10%] bottom-[10%] w-1 bg-primary rounded-full transition-all duration-300"
              ></div>
              {{ value.name }}
            </div>
          </template>
        </TransitionGroup>

        <Transition name="fade">
          <div
              v-if="Object.keys(officialPlugins).length > 0"
              class="flex items-center gap-2 mt-8 mb-1 px-2"
          >
            <div class="h-[1px] bg-700 flex-grow"></div>
            <span class="text-sm text-muted font-medium"
            >官方插件</span
            >
            <div class="h-[1px] bg-700 flex-grow"></div>
          </div>
        </Transition>

        <!-- 插件设置组 -->
        <TransitionGroup
            class="flex flex-col gap-1"
            name="list"
            tag="div"
        >
          <template
              v-for="(value, key) in officialPlugins"
              :key="key"
          >
            <div
                :class="[
                                store.setting.current_page === key
                                    ? 'text-primary bg-primary/10 shadow-sm'
                                    : 'text-normal hover:bg-700/50 hover:translate-x-1',
                            ]"
                class="relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                @click="changePage(String(key))"
            >
              <div
                  v-if="store.setting.current_page === key"
                  class="absolute left-0 top-[10%] bottom-[10%] w-1 bg-primary rounded-full transition-all duration-300"
              ></div>
              {{ value.name }}
            </div>
          </template>
        </TransitionGroup>
      </div>

      <div class="bg-300 w-3/4 p-8 rounded-lg ml-1 flex-grow">
        <component
            :is="routes[store.setting.current_page].component"
            :plugin="routes[store.setting.current_page].plugin"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-move {
  transition: transform 0.3s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.list-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
