import {createRouter, createWebHistory, RouterView} from "vue-router";
import {h} from 'vue';
import CasePage from "./views/CasePage.vue"
import CasesList from "./views/CasesList.vue"
import HomePage from "./views/HomePage"
import ResourcesPage from "./views/ResourcesPage"
import CSVPage from "./views/CSVPage"
// import XESPage from "./views/XESPage"
import LoadingComponent from "./components/LoadingComponent"

const routes = [
    {
        path: "/",
        name: "home",
        component: HomePage,
    },
    {
        path: '/csv',
        name: 'csv',
        component: CSVPage,
        props: true
    }, 
    // {
    //     path: '/xes',
    //     name: 'xes',
    //     component: XESPage,
    //     props: true
    // },
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
