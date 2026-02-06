const orderManager = require('./orderManager')
const tourManager = require('./tourManager')
const Customer = require('./customer')

class LogisticCompany {
    constructor({ id, companyName, address, postalCode, city }) {
        this.id = id
        this.companyName = companyName
        this.address = address
        this.postalCode = postalCode
        this.city = city
        this.vehicles = []
        this.customers = []
    }

    addVehicle(vehicle) {
        this.vehicles.push(vehicle)
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

    createCustomer(customerData) {
        const customer = Customer.create({
            ...customerData,
            companyId: this.id
        })
        this.customers.push(customer)
        return customer
    }

    getCustomers(){
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
            city: companyObj.city
        })

        console.log('Company created: ', newCompany)
        LogisticCompany.list.push(newCompany)

        return newCompany
    }

    static list = []
}

module.exports = LogisticCompany