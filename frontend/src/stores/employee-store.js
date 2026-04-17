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
        async updateEmployee(companyId, employeeId, employeeData) {
            await axios.put(`/companies/${companyId}/employees/${employeeId}`, employeeData)
            await this.getAllEmployees(companyId)
        },
        async deleteEmployee(companyId, employeeId) {
            await axios.delete(`/companies/${companyId}/employees/${employeeId}`)
            await this.getAllEmployees(companyId)
        },
        async resetEmployeePassword(companyId, employeeId, newPassword) {
            await axios.post(`/companies/${companyId}/employees/${employeeId}/reset-password`, { newPassword })
        },
    },
})
