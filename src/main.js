import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { Tabs, Tab } from 'vue3-tabs-component';
import Notifications from '@kyvg/vue3-notification';
import VueApexCharts from "vue3-apexcharts";
import store from './services/store';

import './assets/styles/style.scss';

createApp(App)
    .use(router)
    .use(store)
    .component('tabs', Tabs)
    .component('tab', Tab)
    .use(Notifications)
    .component('apexchart', VueApexCharts)
    .mount("#app");
