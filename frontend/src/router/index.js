import { createRouter, createWebHistory } from 'vue-router'
import { useAccountStore } from '../stores/account-store'
import HomeView from '../views/home-view.vue'
import LoginView from '../views/login-view.vue'
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
                import ('../views/company-view.vue'),
        },
        {
            path: '/companies/:companyId',
            name: 'companyDetail',
            component: () =>
                import ('../views/company-detail-view.vue'),
        },
        {
            path: '/companies/:companyId/customers',
            name: 'companyCustomers',
            component: () =>
                import ('../views/customer-dashboard-view.vue'),
        },
        {
            path: '/companies/:companyId/employees',
            name: 'companyEmployees',
            component: () =>
                import ('../views/employee-view.vue'),
        },
        {
            path: '/companies/:companyId/vehicles',
            name: 'companyVehicles',
            component: () =>
                import ('../views/vehicle-view.vue'),
        },
        {
            path: '/companies/:companyId/dispatcher',
            name: 'dispatcher',
            component: () =>
                import ('../views/dispatcher-dashboard-view.vue'),
        },
        {
            path: '/companies/:companyId/orders',
            name: 'companyOrders',
            component: () =>
                import ('../views/order-list-view.vue'),
        },
        {
            path: '/orders/new',
            name: 'orderCreate',
            component: () =>
                import ('../views/order-create-view.vue'),
        },
        {
            path: '/orders',
            name: 'orderList',
            component: () =>
                import ('../views/order-list-view.vue'),
        },
        {
            path: '/orders/:orderId',
            name: 'orderDetail',
            component: () =>
                import ('../views/order-detail-view.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/admin',
            name: 'admin',
            component: () =>
                import ('../views/admin-dashboard-view.vue'),
        },
        {
            path: '/logout',
            name: 'logout',
            component: () =>
                import ('../views/logout-view.vue'),
        },
    ],
})

router.beforeEach((to, from, next) => {
    const accountStore = useAccountStore()

    if (to.name === 'home' && accountStore.isLoggedIn) {
        if (accountStore.isCustomer) {
            return next({ name: 'orderList' })
        }
        if (accountStore.isEmployee && accountStore.companyId) {
            return next({ name: 'dispatcher', params: { companyId: accountStore.companyId } })
        }
        if (accountStore.isAdmin) {
            return next({ name: 'admin' })
        }
    }

    next()
})

export default router
