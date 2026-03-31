import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () =>
                import ('../views/AboutView.vue'),
        },
        {
            path: '/companies',
            name: 'company',
            component: () =>
                import ('../views/CompanyView.vue'),
        },
        {
            path: '/customers',
            name: 'customer',
            component: () =>
                import ('../views/CustomerView.vue'),
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
            path: '/register',
            name: 'register',
            component: RegisterView,
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