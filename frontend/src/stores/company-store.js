import { defineStore } from 'pinia'
import axios from 'axios'

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
        publicCompanies: [],
    }),
    actions: {
        async getAllCompanies() {
            const { data } = await axios.get('/admin/companies')
            this.companies = data
        },
        async getPublicCompanies() {
            const { data } = await axios.get('/companies/public')
            this.publicCompanies = data
        },
        async getCompany(companyId) {
            const { data } = await axios.get(`/companies/${companyId}`)
            const idx = this.companies.findIndex(c => c._id === companyId)
            if (idx >= 0) {
                this.companies[idx] = data
            } else {
                this.companies.push(data)
            }
            return data
        },
    }
})
