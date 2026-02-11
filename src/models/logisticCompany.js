const orderManager = require('../orderManager')
const tourManager = require('../tourManager')
const Vehicle = require('./vehicle')
const { createCustomer } = require('../customerManager')
const { createEmployee } = require('../employeeManager')

class LogisticCompany {
    constructor({ id, companyName, address, postalCode, city }) {
        this.id = id
        this.companyName = companyName
        this.address = address
        this.postalCode = postalCode
        this.city = city
        this.vehicles = []
        this.customers = []
        this.employees = []
    }

    addVehicle(vehicleData) {
        const vehicle = Vehicle.create({
            ...vehicleData,
            companyId: this.id,
        })
        this.vehicles.push(vehicle)
        return vehicle
    }

    getVehicles() {
        return this.vehicles
    }

    addEmployee(employeeData) {
        const newEmployee = createEmployee({...employeeData, companyId: this.id })
        this.employees.push(newEmployee)
        return newEmployee
    }

    getDispatchers() {
        return this.employees.filter(emp => emp.role === 'Dispatcher')
    }

    createOrder(orderData) {
        return orderManager.createOrder(orderData)
    }

    createTour(tourData) {
        return tourManager.createTour(tourData)
    }

    addCustomer(customerData) {
        const newCustomer = createCustomer({...customerData, companyId: this.id })
        this.customers.push(newCustomer)
        return newCustomer
    }

    getCustomers() {
        return this.customers
    }

    static findById(id) {
        return LogisticCompany.list.find(company => company.id === id)
    }

    static create(companyObj) {
        const newCompany = new LogisticCompany({
            id: Date.now(),
            companyName: companyObj.companyName,
            address: companyObj.address,
            postalCode: companyObj.postalCode,
            city: companyObj.city,
        })

        console.log('Company created: ', newCompany)
        LogisticCompany.list.push(newCompany)

        return newCompany
    }

    static list = []
}

module.exports = LogisticCompany