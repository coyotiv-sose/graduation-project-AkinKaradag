import { defineStore } from 'pinia'
import axios from 'axios'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        companies: [],
        allCustomers: [],
        allOrders: [],
        allEmployees: [],
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
        async updateCustomer(customerId, customerData) {
            await axios.put(`/admin/customers/${customerId}`, customerData)
            await this.getAllCustomers()
        },
        async deleteCustomer(customerId) {
            await axios.delete(`/admin/customers/${customerId}`)
            await this.getAllCustomers()
        },
        async getAllOrders() {
            const { data } = await axios.get('/admin/orders')
            this.allOrders = data
        },
        async updateOrder(orderId, orderData) {
            await axios.put(`/admin/orders/${orderId}`, orderData)
            await this.getAllOrders()
        },
        async deleteOrder(orderId) {
            await axios.delete(`/admin/orders/${orderId}`)
            await this.getAllOrders()
        },
        async getAllEmployees() {
            const { data } = await axios.get('/admin/employees')
            this.allEmployees = data
        },
        async resetEmployeePassword(employeeId, newPassword) {
            await axios.post(`/admin/employees/${employeeId}/reset-password`, { newPassword })
        },
    },
})
