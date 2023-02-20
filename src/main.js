import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import {Tabs,Tab} from 'vue3-tabs-component'

import './assets/styles/style.scss'

createApp(App)
    .use(router)
    .component('tabs',Tabs)
    .component('tab',Tab)
    .mount("#app");
