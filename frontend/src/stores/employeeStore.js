import { defineStore } from 'pinia'
import axios from 'axios'

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [],
    }),
    actions: {
        async getAllEmployees(companyId) {
            const { data } = await axios.get(`/companies/${companyId}/employees`)
            this.employees = data
        },
        async createEmployee(companyId, employeeData) {
            await axios.post(`/companies/${companyId}/employees`, employeeData)
            await this.getAllEmployees(companyId)
        },
    },
})
