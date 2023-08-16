import {createRouter, createWebHistory, RouterView} from "vue-router";
import {h} from 'vue';
import CasePage from "./views/CasePage.vue"
import CasesPage from "./views/CasesPage.vue"
import UploadPage from "./views/UploadPage"
import DashBoard from './views/DashBoard'
import ParametersPage from './views/ParametersPage'
import ColumnsDefinitionPage from "./views/ColumnsDefinitionPage"
import RecommendationsPage from './views/RecommendationsPage'

const routes = [
    {
        path: "/",
        name: "home",
        component: UploadPage,
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
                path: ':completion',
                component: { render: () => h(RouterView)},
                params: {
                    completion: ['completed','ongoing']
                },
                children: [
                    {
                        path: '',
                        name: 'cases',
                        component: CasesPage,
                    },
                    {
                        path: ":caseId",
                        name: "case",
                        component: CasePage,
                        params: {
                            caseId: []
                        }
                    },
                ]
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
