import { defineStore } from 'pinia'
import axios from 'axios'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    lastGeneratedOrder: null,
    isGenerating: false,
    error: '',
  }),
  actions: {
    async generateOrderFromPrompt(customerId, prompt, billingInfo = null) {
      this.isGenerating = true
      this.error = ''
      this.lastGeneratedOrder = null
      try {
        const payload = billingInfo ? { prompt, billingInfo } : { prompt }
        const { data } = await axios.post(`/customers/${customerId}/orders/ai-generate`, payload)
        this.lastGeneratedOrder = data
        return data
      } catch (e) {
        this.error = e.response?.data?.error || e.message || 'Something went wrong'
        throw e
      } finally {
        this.isGenerating = false
      }
    },
    async getOrders(customerId) {
      const { data } = await axios.get(`/customers/${customerId}/orders`)
      this.orders = data
    },
    async getOrdersByCompany(companyId) {
      const { data } = await axios.get(`/companies/${companyId}/orders`)
      this.orders = data
    },
    async getOrderById(orderId) {
      const { data } = await axios.get(`/orders/${orderId}`)
      return data
    },
    async updateOrder(orderId, updateData) {
      const { data } = await axios.put(`/orders/${orderId}`, updateData)
      return data
    },
    async deleteOrderByCompany(companyId, orderId) {
      await axios.delete(`/companies/${companyId}/orders/${orderId}`)
    },
    async createOrderForCustomer(customerId, orderData) {
      const { data } = await axios.post(`/customers/${customerId}/orders`, orderData)
      return data
    },

    applyOrderUpdate(updatedOrder) {
      const index = this.orders.findIndex(o => o._id === updatedOrder._id)
      if (index !== -1) {
        this.orders[index] = updatedOrder
      }
    },

    applyOrderCreated(newOrder) {
      const exists = this.orders.some(o => o._id === newOrder._id)
      if (!exists) {
        this.orders.push(newOrder)
      }
    },

    applyOrderDeleted(orderId) {
      this.orders = this.orders.filter(o => o._id !== orderId)
    },
  },
})
