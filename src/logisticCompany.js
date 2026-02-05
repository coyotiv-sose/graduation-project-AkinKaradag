const orderManager = require('./orderManager')
const tourManager = require('./tourManager')


class LogisticCompany{
  constructor({profile, companyName, address, postalCode, city}) {
    this.id = profile.id
    this.companyName = companyName
    this.address = address
    this.postalCode = postalCode
    this.city = city
    this.vehicles = []
    this.customers = []
  }

  addVehicle(vehicle){
    this.vehicles.push(vehicle)
  }

  getDispatchers(){
    return this.employees.filter(emp => emp.role === 'Dispatcher')
  }

  createOrder(orderData) {
    return orderManager.createOrder(orderData)
}

  createTour(tourData) {
    return tourManager.createTour(tourData)
  }

  addCustomer(customer){
    this.customers.push(customer)
  }
}

module.exports = LogisticCompany