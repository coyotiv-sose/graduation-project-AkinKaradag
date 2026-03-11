import { defineStore } from 'pinia'
import axios from 'axios'

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [],
    }),
    actions: {
        async getAllCompanies() {
            const { data } = await axios.get('/companies')
            this.companies = data
        },
        async createCompany(companyData) {
            await axios.post('/companies', companyData)
            await this.getAllCompanies()
        }
    }
})