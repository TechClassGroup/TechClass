<script lang="ts" setup>
import logger from "../modules/logger";
import {useApplicationStore} from "../stores/useApplicationStore";
import About from "./setting/About.vue";
import {computed, defineComponent, markRaw, watch} from "vue";
import PluginSet from "./setting/PluginSet.vue";
import {computedPluginsComponent} from "../modules/pluginUtils";
import {PluginStore} from "../types/plugins";

const store = useApplicationStore();

interface Route {
    [key: string]: {
        name: string;
        component: ReturnType<typeof defineComponent>;
        store?: PluginStore;
    };
}

const officialPlugins = computed<Route>(() => {
    return computedPluginsComponent.value
        .filter((plugin) => plugin.isOfficial && plugin.component.settingPage)
        .sort((a, b) => a.name.localeCompare(b.name))
        .reduce((acc, plugin) => {
            acc[`official-plugin-${plugin.id}`] = {
                name: plugin.name,
                component: plugin.component.settingPage,
                store: plugin.store,
            };
            return acc;
        }, {});
});

const baseRoutes: Route = {
    about: {
        name: "关于",
        component: markRaw(About),
    },
    plugin: {
        name: "插件配置",
        component: markRaw(PluginSet),
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
    { immediate: true }
);
</script>

<template>
    <div
        :class="store.setting.open ? 'z-50 opacity-100' : '-z-50 opacity-0'"
        class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/30 transition-all duration-300"
        @click.self="store.reverseSettingOpen()"
    >
        <div
            class="relative w-[1200px] max-h-[90vh] h-[800px] p-1 max-w-[70vw] bg-gray-100 rounded-xl flex overflow-hidden shadow-2xl transform transition-transform duration-300"
            :class="store.setting.open ? 'scale-100' : 'scale-95'"
        >
            <button
                class="absolute top-1 right-1 m-2 w-8 h-8 hover:bg-gray-200 rounded-full transition-all duration-200 flex items-center justify-center"
                @click="store.reverseSettingOpen()"
            >
                <img
                    alt="关闭窗口"
                    src="../assets/images/web-window-close.svg"
                    class="w-6 h-6"
                />
            </button>

            <div
                class="w-1/4 max-w-52  p-3 bg-gray-200/70 backdrop-blur-sm rounded-lg overflow-y-auto flex-col flex gap-1 m-1"
            >
                <!-- 基础设置组 -->
                <TransitionGroup tag="div" class="flex flex-col gap-1">
                    <template v-for="(value, key) in baseRoutes" :key="key">
                        <div
                            @click="changePage(String(key))"
                            class="relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                            :class="[
                                store.setting.current_page === key
                                    ? 'text-[#0078D4] bg-[#0078D4]/10 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-300/50 hover:translate-x-1',
                            ]"
                        >
                            <div
                                v-if="store.setting.current_page === key"
                                class="absolute left-0 top-[10%] bottom-[10%] w-1 bg-[#0078D4] rounded-full transition-all duration-300"
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
                        <div class="h-[1px] bg-gray-300 flex-grow"></div>
                        <span class="text-sm text-gray-500 font-medium"
                            >官方插件</span
                        >
                        <div class="h-[1px] bg-gray-300 flex-grow"></div>
                    </div>
                </Transition>

                <!-- 插件设置组 -->
                <TransitionGroup
                    name="list"
                    tag="div"
                    class="flex flex-col gap-1"
                >
                    <template
                        v-for="(value, key) in officialPlugins"
                        :key="key"
                    >
                        <div
                            @click="changePage(String(key))"
                            class="relative px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 select-none"
                            :class="[
                                store.setting.current_page === key
                                    ? 'text-[#0078D4] bg-[#0078D4]/10 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-300/50 hover:translate-x-1',
                            ]"
                        >
                            <div
                                v-if="store.setting.current_page === key"
                                class="absolute left-0 top-[10%] bottom-[10%] w-1 bg-[#0078D4] rounded-full transition-all duration-300"
                            ></div>
                            {{ value.name }}
                        </div>
                    </template>
                </TransitionGroup>
            </div>

            <div class="bg-gray-100 w-3/4 p-8 rounded-lg ml-1 flex-grow">
                <component
                    :is="routes[store.setting.current_page].component"
                    v-bind="
                        routes[store.setting.current_page].store
                            ? {
                                  store: routes[store.setting.current_page]
                                      .store,
                              }
                            : {}
                    "
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
    opacity: 0;
    transform: translateX(-30px);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(-30px);
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
    opacity: 0;
    transform: translateX(-30px);
}
</style>
