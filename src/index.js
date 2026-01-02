console.log('KaraLog is an application which helps you to manage your daily planning in logistics.')

class LogisticCompany{
  constructor(companyName, address, postalCode, city) {
    this.companyName = companyName
    this.address = address
    this.postalCode = postalCode
    this.city = city
    this.vehicle = []
    this.customer = []
    this.takenOrder = []
  }

  takeOrder(order) {
    this.takenOrder.push(order)
  }
}

class Dispatcher{
  constructor(name){
    this.name = name
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
const dimension = new Dimension(200, 400, 250)
const newCargo = new Cargo('Euro-Pallet', dimension, 300, 2)
const newOrder = new Order(1234, 'Basel', 'Zurich', 'Google', '2026-04-12', 'Ready to pick-up')
newOrder.addCargo(newCargo)
newVehicle.loadedCargo(newCargo)

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
