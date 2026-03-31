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
    async generateOrderFromPrompt(customerId, prompt) {
      this.isGenerating = true
      this.error = ''
      this.lastGeneratedOrder = null
      try {
        const { data } = await axios.post(`/customers/${customerId}/orders/ai-generate`, {
          prompt,
        })
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
  },
})
