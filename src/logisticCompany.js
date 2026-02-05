const orderManager = require('./orderManager')
const tourManager = require('./tourManager')


class LogisticCompany{
  constructor({id, companyName, address, postalCode, city}) {
    this.id = id
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

  static create(companyObj) {
    console.log(`Creating a new Company with name ${companyObj.companyName}`)

    const newCompany = new LogisticCompany({
      id: 12345321,
      companyName: companyObj.companyName,
      address: 'Industry Street 1',
      postalCode: '43234',
      city: 'Industry',
    })

    console.log('Company created: ', newCompany)
    LogisticCompany.list.push(newCompany)

    return newCompany


  }

  static list = []

}

module.exports = LogisticCompany