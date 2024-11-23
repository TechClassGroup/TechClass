import {createApp} from "vue";
import App from "./App.vue";
import "./assets/styles/main.css"
import logger from "./modules/logger.ts";
import {createPinia} from "pinia";
const pinia = createPinia();
const app = createApp(App)

app.use(pinia);
app.mount('#app')

logger.info("前端启动成功");