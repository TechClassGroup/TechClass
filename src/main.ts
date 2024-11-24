import {createApp} from "vue";
import App from "./App.vue";
import "./assets/styles/main.css"
import logger from "./modules/logger.ts";
import {createPinia} from "pinia";
import router from "./routers";

const pinia = createPinia();
const app = createApp(App)

app.use(pinia);
app.use(router)
app.mount('#app')

logger.info("前端启动成功");

window.addEventListener('popstate', (event) => {
    event.preventDefault();
    history.pushState(null, '', location.href);
});