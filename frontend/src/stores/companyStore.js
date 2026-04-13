import { defineStore } from 'pinia'
import axios from 'axios'

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
    }),
    actions: {
        async getAllCompanies() {
            const { data } = await axios.get('/admin/companies')
            this.companies = data
        },
    }
})