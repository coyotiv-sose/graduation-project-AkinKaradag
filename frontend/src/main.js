import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './app.vue'
import router from './router'
import axios from 'axios'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL
axios.defaults.withCredentials = true

app.mount('#app')
