import {createRouter, createWebHistory, RouterView} from "vue-router";
import {h} from 'vue';
import CasePage from "./views/CasePage.vue"
import CasesList from "./views/CasesList.vue"
import HomePage from "./views/HomePage"
import ResourcesPage from "./views/ResourcesPage"
import DashBoard from './views/DashBoard'
import ParametersPage from './views/ParametersPage'
import ColumnsDefinitionPage from "./views/ColumnsDefinitionPage"
import LoadingComponent from "./components/LoadingComponent"
import ErrorPage from  "./views/ErrorPage"

const routes = [
    {
        path: "/",
        name: "home",
        component: HomePage,
    },
    {
        path: "/error",
        name: "error",
        component: ErrorPage,
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
        props: true
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
    {
        path: '/loading',
        name: 'loading',
        component: LoadingComponent,
        props: true
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
