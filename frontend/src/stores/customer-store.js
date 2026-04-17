import { defineStore } from 'pinia'
import axios from 'axios'

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [],
    }),
    actions: {
        async getAllCustomers(companyId) {
            const { data } = await axios.get(`/companies/${companyId}/customers`)
            this.customers = data
        },
        async createCustomer(companyId, customerData) {
            await axios.post(`/companies/${companyId}/customers`, customerData)
            await this.getAllCustomers(companyId)
        },
        async updateCustomer(companyId, customerId, customerData) {
            await axios.put(`/companies/${companyId}/customers/${customerId}`, customerData)
            await this.getAllCustomers(companyId)
        },
        async deleteCustomer(companyId, customerId) {
            await axios.delete(`/companies/${companyId}/customers/${customerId}`)
            await this.getAllCustomers(companyId)
        },
        async resetCustomerPassword(companyId, customerId, newPassword) {
            await axios.post(`/companies/${companyId}/customers/${customerId}/reset-password`, { newPassword })
        },
    },
})