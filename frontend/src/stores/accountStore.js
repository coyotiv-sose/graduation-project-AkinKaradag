import { defineStore } from 'pinia'
import axios from 'axios'

export const useAccountStore = defineStore('account', {
    state: () => ({
        user: null,
    }),
    actions: {
        async fetchUser() {
            try {
                const { data } = await axios.get('/accounts/session')
                this.user = data
            } catch {
                this.user = null
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
        },
    },
})
