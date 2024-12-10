import {createApp} from "vue";
import App from "./App.vue";
import "./assets/styles/main.css"
import logger from "./modules/logger.ts";
import {createPinia} from "pinia";
import "vue-draggable-resizable/style.css"
// @ts-ignore
import VueDraggableResizable from 'vue-draggable-resizable'
import {loadNewPlugin} from "@/modules/plugins_manager.ts";
import timeDisplay from "@/plugins/timeDisplay/timeDisplay.ts";
import {StoragePiniaPlugin} from "@/stores/piniaPlugins.ts";

const pinia = createPinia();
pinia.use(StoragePiniaPlugin)

const app = createApp(App)

app.use(pinia);
app.mount('#app')
app.component('vue-draggable-resizable', VueDraggableResizable)
logger.info("前端启动成功");

// 不允许用户通过浏览器的前进后退按钮进行页面跳转 防止一些奇妙的bug
window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
});
loadNewPlugin(timeDisplay);