import {createApp} from "vue";
import App from "./App.vue";
import "./assets/styles/main.css"
import logger from "./modules/logger.ts";

createApp(App).mount("#app");

logger.info("前端启动成功");