const Order = require('./order')
const Tour = require('./tour')

class LogisticCompany{
  constructor(companyName, address, postalCode, city) {
    this.companyName = companyName
    this.address = address
    this.postalCode = postalCode
    this.city = city

    this.vehicles = []
    this.customers = []
    this.orders = []
    this.employees = []
    this.tours = []
  }

  addVehicle(vehicle){
    this.vehicles.push(vehicle)
  }

  addEmployee(employee){
    this.employees.push(employee)
  }

  getDispatchers(){
    return this.employees.filter(emp => emp.role === 'Dispatcher')
  }

  createOrder({orderId, origin, destination, customer, deliveryDate, state}) {
    const order = new Order(orderId, origin, destination, customer, deliveryDate, state)
    this.orders.push(order)
    return order
}

createTour(tourId, vehicle, date, startLocation, endLocation) {
    const tour = new Tour(tourId, vehicle, date, startLocation, endLocation)
    this.tours.push(tour)
    return tour
  }

  addCustomer(customer){
    this.customers.push(customer)
  }
}

module.exports = LogisticCompany