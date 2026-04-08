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
            path: '/companies/:companyId/vehicles',
            name: 'companyVehicles',
            component: () =>
                import ('../views/VehicleView.vue'),
        },
        {
            path: '/companies/:companyId/dispatcher',
            name: 'dispatcher',
            component: () =>
                import ('../views/DispatcherView.vue'),
        },
        {
            path: '/companies/:companyId/orders',
            name: 'companyOrders',
            component: () =>
                import ('../views/OrderListView.vue'),
        },
        {
            path: '/orders/new',
            name: 'orderCreate',
            component: () =>
                import ('../views/OrderCreateView.vue'),
        },
        {
            path: '/orders',
            name: 'orderList',
            component: () =>
                import ('../views/OrderListView.vue'),
        },
        {
            path: '/orders/:orderId',
            name: 'orderDetail',
            component: () =>
                import ('../views/OrderDetailView.vue'),
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
