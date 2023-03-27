import {createRouter, createWebHistory, RouterView} from "vue-router";
import {h} from 'vue';
import CasePage from "./views/CasePage.vue"
import CasesList from "./views/CasesList.vue"
import HomePage from "./views/HomePage"
import DashBoard from './views/DashBoard'
import ParametersPage from './views/ParametersPage'
import ColumnsDefinitionPage from "./views/ColumnsDefinitionPage"
import RecommendationsPage from './views/RecommendationsPage'

const routes = [
    {
        path: "/",
        name: "home",
        component: HomePage,
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: DashBoard,
    },
    {
        path: "/parameters",
        name: "parameters",
        component: ParametersPage,
    },
    {
        path: '/columns',
        name: 'columns',
        component: ColumnsDefinitionPage,
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
        path: "/recommendations",
        name: "recommendations",
        component: RecommendationsPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
