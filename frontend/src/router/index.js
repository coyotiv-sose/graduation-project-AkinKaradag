import { createRouter, createWebHistory } from 'vue-router'
import { homeRedirectGuard } from './guards/home-redirect-guard'
import HomeView from '../views/home-view.vue'
import LoginView from '../views/login-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { layout: 'public' },
    },
    {
      path: '/companies',
      name: 'companies',
      component: () => import('../views/company-view.vue'),
    },
    {
      path: '/companies/:companyId',
      name: 'companyDetail',
      component: () => import('../views/company-detail-view.vue'),
    },
    {
      path: '/companies/:companyId/customers',
      name: 'companyCustomers',
      component: () => import('../views/customer-dashboard-view.vue'),
    },
    {
      path: '/companies/:companyId/employees',
      name: 'companyEmployees',
      component: () => import('../views/employee-view.vue'),
    },
    {
      path: '/companies/:companyId/vehicles',
      name: 'companyVehicles',
      component: () => import('../views/vehicle-view.vue'),
    },
    {
      path: '/companies/:companyId/dispatcher',
      name: 'dispatcher',
      component: () => import('../views/dispatcher-dashboard-view.vue'),
    },
    {
      path: '/companies/:companyId/orders',
      name: 'companyOrders',
      component: () => import('../views/order-list-view.vue'),
    },
    {
      path: '/orders/new',
      name: 'orderCreate',
      component: () => import('../views/order-create-view.vue'),
    },
    {
      path: '/orders',
      name: 'orderList',
      component: () => import('../views/order-list-view.vue'),
    },
    {
      path: '/orders/:orderId',
      name: 'orderDetail',
      component: () => import('../views/order-detail-view.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { layout: 'public' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/about-view.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin-dashboard-view.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/logout-view.vue'),
      meta: { layout: 'public' },
    },
  ],
})

router.beforeEach(homeRedirectGuard)

export default router
