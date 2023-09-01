import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { Tabs, Tab } from 'vue3-tabs-component';
import Notifications from '@kyvg/vue3-notification';
import VueApexCharts from "vue3-apexcharts";

import './assets/styles/style.scss';

createApp(App)
    .use(router)
    .component('tabs', Tabs)
    .component('tab', Tab)
    .use(Notifications)
    .component('apexchart', VueApexCharts)
    .mount("#app");
