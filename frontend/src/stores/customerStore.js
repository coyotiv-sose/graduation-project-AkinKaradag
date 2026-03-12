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
    },
})