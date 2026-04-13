import { defineStore } from 'pinia'
import axios from 'axios'

export const useAccountStore = defineStore('account', {
    state: () => ({
        user: null,
        profile: null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
        role: (state) => state.user?.role || null,
        isCustomer: (state) => state.user?.role === 'customer',
        isEmployee: (state) => state.user?.role === 'employee',
        isAdmin: (state) => state.user?.role === 'admin',
        companyId: (state) => state.profile?.company || null,
        customerId: (state) => state.profile?._id || null,
    },
    actions: {
        async fetchUser() {
            try {
                const { data } = await axios.get('/accounts/session')
                if (data && data._id) {
                    this.profile = data.profile || null
                    this.user = data
                } else {
                    this.user = null
                    this.profile = null
                }
            } catch {
                this.user = null
                this.profile = null
            }
        },
        async login(email, password) {
            await axios.post('/accounts/session', { email, password })
            await this.fetchUser()
        },
        async register(payload) {
            await axios.post('/accounts', payload)
        },
        async logout() {
            await axios.delete('/accounts/session')
            this.user = null
            this.profile = null
        },
    },
})
