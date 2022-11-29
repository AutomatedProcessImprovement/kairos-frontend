import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import './assets/styles/style.scss'
import {TippyPlugin} from 'tippy.vue';

createApp(App)
    .use(router)
    .use(TippyPlugin)
    .mount("#app");
