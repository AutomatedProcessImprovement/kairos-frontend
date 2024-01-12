import { createRouter, createWebHistory, RouterView } from "vue-router";
import { h } from 'vue';
import CasePage from "./pages/CasePage.vue"
import CasesPage from "./pages/CasesPage.vue"
import UploadPage from "./pages/UploadPage"
import DashBoardPage from './pages/DashBoardPage'
import ParametersPage from './pages/ParametersPage'
import ColumnsDefinitionPage from "./pages/ColumnsDefinitionPage"
import RecommendationsPage from './pages/RecommendationsPage'

const routes = [
    {
        path: "/",
        name: "home",
        component: UploadPage,
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: DashBoardPage,
    },
    {
        path: "/event-logs/:logId?",
        params: {
            logId: []
        },
        children: [
            {
                path: "cases/:completion",
                component: { render: () => h(RouterView) },
                params: {
                    completion: ['completed', 'ongoing']
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
            {
                path: "parameters",
                name: "parameters",
                component: ParametersPage,
            },
            {
                path: 'columns',
                name: 'columns',
                component: ColumnsDefinitionPage,
            },
            {
                path: "recommendations",
                name: "recommendations",
                component: RecommendationsPage,
            },
        ]
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
