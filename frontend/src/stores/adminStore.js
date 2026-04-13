import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        companies: [],
        allCustomers: [],
        allOrders: [],
    }),
    actions: {
        async getAllCompanies() {
            const { data } = await axios.get('/admin/companies')
            this.companies = data
        },
        async createCompany(companyData) {
            await axios.post('/admin/companies', companyData)
            await this.getAllCompanies()
        },
        async updateCompany(companyId, companyData) {
            await axios.put(`/admin/companies/${companyId}`, companyData)
            await this.getAllCompanies()
        },
        async deleteCompany(companyId) {
            await axios.delete(`/admin/companies/${companyId}`)
            await this.getAllCompanies()
        },
        async getAllCustomers() {
            const { data } = await axios.get('/admin/customers')
            this.allCustomers = data
        },
        async getAllOrders() {
            const { data } = await axios.get('/admin/orders')
            this.allOrders = data
        },
    },
})
