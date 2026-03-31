import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/companies',
            name: 'companies',
            component: () =>
                import ('../views/CompanyView.vue'),
        },
        {
            path: '/companies/:companyId',
            name: 'companyDetail',
            component: () =>
                import ('../views/CompanyDetailView.vue'),
        },
        {
            path: '/companies/:companyId/customers',
            name: 'companyCustomers',
            component: () =>
                import ('../views/CustomerView.vue'),
        },
        {
            path: '/companies/:companyId/employees',
            name: 'companyEmployees',
            component: () =>
                import ('../views/EmployeeView.vue'),
        },
        {
            path: '/orders',
            name: 'orders',
            component: () =>
                import ('../views/OrderView.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/logout',
            name: 'logout',
            component: () =>
                import ('../views/LogoutView.vue'),
        },
    ],
})

export default router