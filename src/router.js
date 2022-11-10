import {createRouter, createWebHistory} from "vue-router";
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
        name: "cases",
        component: CasesList
    },
    {
        path: "/cases/:caseId",
        name: "case",
        component: CasePage,
        params: true
    },
    {
        path: "/resources",
        name: "resources",
        component: ResourcesPage
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: "active"
});

export default router;
