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

  addCustomer(customer){
    this.customers.push(customer)
  }
}