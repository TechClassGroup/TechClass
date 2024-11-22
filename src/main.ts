import {createApp} from "vue";
import App from "./App.vue";
import "./assets/styles/main.css"
import logger from "./modules/logger.ts";

createApp(App).mount("#app");
logger.trace("this is a test")
logger.debug("this is a test")
logger.info("this is a test")
logger.warn("this is a test")
logger.error("this is a test")