import {createRouter, createWebHistory, RouterView} from "vue-router";
import {h} from 'vue';
import CasePage from "./views/CasePage.vue"
import CasesList from "./views/CasesList.vue"
import HomePage from "./views/HomePage"
import ResourcesPage from "./views/ResourcesPage"

const routes = [
    {
        path: "/",
        name: "home",
        component: HomePage
    },
    {
        path: "/cases",
        component: { render: () => h(RouterView)},
        children: [
            {
                path: '',
                name: 'cases',
                component: CasesList
            },
            {
                path: ":caseId",
                name: "case",
                component: CasePage,
                params: true
            },
        ]
    },
    
    {
        path: "/resources",
        name: "resources",
        component: ResourcesPage
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
