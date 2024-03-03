import {createRouter, createWebHistory, type RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Authenticated',
        component: () => import('@/layouts/authenticated/Authenticated.vue'),
        children: [
            {
                path: '',
                name: '首页',
                component: () =>import('@/views/Home.vue'),
            },
            {
                path: '/overdue',
                name: '逾期管理',
                component: () => import('@/views/Overdue.vue'),
            }
        ]
    },
    {
        path: '/login',
        name: '登录',
        component: () => import('@/views/Login.vue'),
    }
];

const router = createRouter({
    history: createWebHistory('/'),
    routes,
});

export default router
