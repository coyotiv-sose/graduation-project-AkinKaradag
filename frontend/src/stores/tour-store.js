import { defineStore } from 'pinia'
import axios from 'axios'

export const useTourStore = defineStore('tour', {
    state: () => ({
        tours: [],
    }),
    actions: {
        async getAllTours(companyId) {
            const { data } = await axios.get(`/companies/${companyId}/tours`)
            this.tours = data
        },
        async createTour(companyId, tourData) {
            await axios.post(`/companies/${companyId}/tours`, tourData)
            await this.getAllTours(companyId)
        },
        async addOrderToTour(companyId, tourId, orderId) {
            await axios.post(`/companies/${companyId}/tours/${tourId}`, { orderId })
            await this.getAllTours(companyId)
        },
        async assignVehicleToTour(tourId, vehicleId) {
            await axios.put(`/tours/${tourId}/vehicles`, { vehicleId })
        },
        async updateTour(companyId, tourId, updateData) {
            await axios.put(`/companies/${companyId}/tours/${tourId}`, updateData)
            await this.getAllTours(companyId)
        },
    },
})
