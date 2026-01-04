console.log('KaraLog is an application which helps you to manage your daily planning in logistics.')

class LogisticCompany{
  constructor(companyName, address, postalCode, city) {
    this.companyName = companyName
    this.address = address
    this.postalCode = postalCode
    this.city = city

    this.vehicle = []
    this.customers = []
    this.orders = []
    this.employees = []
  }

  addVehicle(vehicle){
    this.vehicle.push(vehicle)
  }

  addDispatcher(employee){
    this.employees.push(employee)
  }

  getDispatchers(){
    return this.employees.filter(emp => emp.role === 'Dispatcher')
  }

  createOrder({orderId, origin, destination, customer, deliveryDate, state}){ {
    const order = new Order(orderId, origin, destination, customer, deliveryDate, state)
    this.orders.push(order)
  }
}

  addCustomer(customer){
    this.customers.push(customer)
  }
}

class Employee{
  constructor(name, role){
    this.name = name
    this.role = role
  }

}

class Customer{
  constructor(customerName, address, postalCode, city, VATnr) {
    this.customerName = customerName
    this.address = address
    this.postalCode = postalCode
    this.city = city
    this.VATnr = VATnr
    this.orders = []
  }

  makeOrder(order){
    this.orders.push(order)
  } 

}

class Vehicle {
  isAvailable = true

  constructor(name, brand, model, year, payload) {
    this.name = name
    this.brand = brand
    this.model = model
    this.year = year
    this.payload = payload
    this.cargos = []
  }

  loadedCargo(cargo) {
    this.cargos.push(cargo)
  }
}

class Order {
  constructor(orderId, origin, destination, customer, deliveryDate, state) {
    this.orderId = orderId
    this.origin = origin
    this.destination = destination
    this.customer = customer
    this.deliveryDate = deliveryDate
    this.state = state
    this.cargos = []
  }

  addCargo(cargo) {
    this.cargos.push(cargo)
  }
}

// helper class
class Dimension {
  constructor(width, height, depth) {
    this.width = width
    this.height = height
    this.depth = depth
  }
}

class Cargo {
  constructor(loadCarrierType, dimensions, weight, quantity) {
    this.loadCarrierType = loadCarrierType
    this.dimensions = dimensions
    this.weight = weight
    this.quantity = quantity
  }
}

const newVehicle = new Vehicle('truck-1', 'Mercedes', 'someModel', '2019', '17t')
const anotherVehicle = new Vehicle('truck-2', 'Volvo', 'anotherModel', '2020', '20t')
const newAnotherVehicle = new Vehicle('truck-3', 'Scania', 'differentModel', '2021', '25t')
const dimension = new Dimension(200, 400, 250)
const newCargo = new Cargo('Euro-Pallet', dimension, 300, 2)
const newOrder = new Order(1234, 'Basel', 'Zurich', 'Google', '2026-04-12', 'Ready to pick-up')
const newOrder1 = new Order(5678, 'Zurich', 'Bern', 'Microsoft', '2026-05-21', 'On Wrapping')
const newOrder2 = new Order(9101, 'Bern', 'Basel', 'Adobe', '2026-07-30', 'Ready to pick-up')
const newCompany = new LogisticCompany("Alpha Logistic", "Main Street 1", 1234, "SomeWhere")
const customer1 = new Customer('German dream', 'Main Street 3', 12345, 'Stuttgart', 9191919)
const customer2 = new Customer('Swiss dream', 'Main Street 5', 4000, 'Basel', 878288)
const customer3 = new Customer('Turkish dream', 'Main Street 7', 4055, 'Basel', 8293081)
newOrder.addCargo(newCargo)
newVehicle.loadedCargo(newCargo)
customer2.makeOrder(newOrder1)
customer2.makeOrder(newOrder2)
newCompany.employee('James')
newCompany.employee('Jack')
newCompany.employee('John')
newCompany.takeOrder(newOrder)
newCompany.takeOrder(newOrder1)
newCompany.takeOrder(newOrder2)
newCompany.buyVehicle(anotherVehicle)
newCompany.buyVehicle(newAnotherVehicle)


console.log(`The Company ${newCompany.companyName} from ${newCompany.city} starts the tour always from the ${newCompany.address}. 
This company has the following employees: ${newCompany.employees.map(employee => `${employee.name}`).join('; ')}
They have already follwogin order to work on it: ${newCompany.takenOrder.map(order => `${order.orderId} from ${order.origin} to ${order.destination} for ${order.customer}`).join('; ')}
The company owns the following vehicles: ${newCompany.vehicle.map(vehicle => `${vehicle.name} - ${vehicle.brand} ${vehicle.model} (${vehicle.year}) with payload of ${vehicle.payload}`).join('; ')}
`)

console.log(`The Customer ${customer2.customerName} has made following orders: ${customer2.orders
  .map(order => `${order.orderId} from ${order.origin} to ${order.destination}`)
  .join('; ')
}`)

console.log(
  `A new truck is created with followding properites: ${newVehicle.name}, ${newVehicle.brand}, ${newVehicle.model}, ${newVehicle.year}, ${newVehicle.payload}`
)

console.log(
  `The truck will load the Cargo: ${newVehicle.cargos
    .map(
      cargo =>
        `${cargo.loadCarrierType} x ${cargo.quantity} with the dimension ${cargo.dimensions.width}x${cargo.dimensions.height}x${cargo.dimensions.depth} and weight ${cargo.weight}`
    )
    .join('; ')}`
)

console.log(
  `The Cargo is loaded by ${newCargo.loadCarrierType} and has a width of ${newCargo.dimensions.width} a height of ${newCargo.dimensions.height} and depth of ${newCargo.dimensions.depth}. The weight of the Cargo is ${newCargo.weight} kg and total pieces of ${newCargo.quantity}`
)

console.log(
  `You've recorded a new Order with Id: ${newOrder.orderId}, which will picked up from ${newOrder.origin} and delivered to ${newOrder.destination} on ${newOrder.deliveryDate}. The current state is ${newOrder.state}`
)

console.log(
  `The order ${newOrder.orderId} has the following cargo: ${newOrder.cargos
    .map(cargo => `${cargo.loadCarrierType} x ${cargo.quantity} from ${newOrder.origin} to ${newOrder.destination}`)
    .join('; ')}`
)
