import { defineStore } from 'pinia'
import axios from 'axios'

export const useVehicleStore = defineStore('vehicle', {
    state: () => ({
        vehicles: [],
    }),
    actions: {
        async getAllVehicles(companyId) {
            const { data } = await axios.get(`/companies/${companyId}/vehicles`)
            this.vehicles = data
        },
        async createVehicle(companyId, vehicleData) {
            await axios.post(`/companies/${companyId}/vehicles`, vehicleData)
            await this.getAllVehicles(companyId)
        },
        async updateVehicle(companyId, vehicleId, updateData) {
            await axios.put(`/companies/${companyId}/vehicles/${vehicleId}`, updateData)
            await this.getAllVehicles(companyId)
        },
    },
})
