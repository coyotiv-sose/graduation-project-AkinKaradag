console.log('KaraLog is an application which helps you to manage your daily planning in logistics.')

const newVehicle = new Vehicle('truck-1', 'Mercedes', 'someModel', '2019', '17t')
const anotherVehicle = new Vehicle('truck-2', 'Volvo', 'anotherModel', '2020', '20t')
const newAnotherVehicle = new Vehicle('truck-3', 'Scania', 'differentModel', '2021', '25t')
const dimension = new Dimension(200, 400, 250)
const newCargo = new Cargo('Euro-Pallet', dimension, 300, 2)
const newCompany = new LogisticCompany("Alpha Logistic", "Main Street 1", 1234, "SomeWhere")
const customer1 = new Customer('German dream', 'Main Street 3', 12345, 'Stuttgart', 9191919)
const customer2 = new Customer('Swiss dream', 'Main Street 5', 4000, 'Basel', 878288)
const customer3 = new Customer('Turkish dream', 'Main Street 7', 4055, 'Basel', 8293081)
const newOrder = newCompany.createOrder({orderId: 1234, origin: 'Basel', destination: 'Zurich', customer: customer1, deliveryDate: '2026-04-12', state: 'Ready to pick-up'})
const newOrder1 = newCompany.createOrder({orderId: 5678, origin: 'Zurich', destination: 'Bern', customer: customer2, deliveryDate: '2026-05-21', state: 'On Wrapping'})
const newOrder2 = newCompany.createOrder({orderId: 9101, origin: 'Bern', destination: 'Basel', customer: customer3, deliveryDate: '2026-07-30', state: 'Ready to pick-up'})
const orderFromCustomer2 = customer2.placeOrder(newCompany, {orderId: 1122,  origin: 'Geneva', destination: 'Lausanne', deliveryDate: '2026-08-15', state: 'Pending'})
newOrder.addCargo(newCargo)
newVehicle.loadCargo(newCargo)
newCompany.addEmployee(new Employee('James', 'Dispatcher'))
newCompany.addEmployee(new Employee('Jack', 'Driver'))
newCompany.addEmployee(new Employee('John', 'Manager'))
newCompany.addVehicle(anotherVehicle)
newCompany.addVehicle(newAnotherVehicle)


console.log(`The Company ${newCompany.companyName} from ${newCompany.city} starts the tour always from the ${newCompany.address}. 
This company has the following employees: ${newCompany.employees.map(employee => `${employee.name}`).join('; ')}
They have already follwogin order to work on it: ${newCompany.orders.map(order => `${order.orderId} from ${order.origin} to ${order.destination} for ${order.customer}`).join('; ')}
The company owns the following vehicles: ${newCompany.vehicles.map(vehicle => `${vehicle.name} - ${vehicle.brand} ${vehicle.model} (${vehicle.year}) with payload of ${vehicle.payload}`).join('; ')}
`)

console.log(`The Customer ${customer2.customerName} has made following orders: ${newCompany.orders.filter(order => order.customer === customer2)  
  .map(order => `${order.orderId} from ${order.origin} to ${order.destination}`)
  .join('; ')
}`)

console.log('Customer placed order:', orderFromCustomer2.orderId, orderFromCustomer2.customer.customerName)

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
