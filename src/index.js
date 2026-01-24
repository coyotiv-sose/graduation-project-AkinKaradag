const Vehicle = require('./vehicle')
const Dimension = require('./dimension')
const Cargo = require('./cargo')
const LogisticCompany = require('./logisticCompany')
const Customer = require('./customer')
const BillingInfo = require('./billingInfo')
const Account = require('./account')
const CustomerProfile = require('./customerProfile')


console.log('KaraLog is an application which helps you to manage your daily planning in logistics.')

const newVehicle = new Vehicle('truck-1', 'Mercedes', 'someModel', '2019', '17t')
const anotherVehicle = new Vehicle('truck-2', 'Volvo', 'anotherModel', '2020', '20t')
const newAnotherVehicle = new Vehicle('truck-3', 'Scania', 'differentModel', '2021', '25t')

const dimension = new Dimension(200, 400, 250)
const newCargo = new Cargo('Euro-Pallet', dimension, 300, 2)

const newCompany = new LogisticCompany("Alpha Logistic", "Main Street 1", 1234, "SomeWhere")

const account = new Account({id: 1, email: 'something@mail.com', password: 'shouldNotbeHere'})
const profile = new CustomerProfile({id: 100, accountId: account.id})
const billingInfo = new BillingInfo({customerName: 'ImAClient', address: 'SomeStreet 1', postalCode: 1234, city: 'Zurich', VATnr: 43211234})
const customer1 = new Customer({profile, account, customerName: billingInfo.customerName, billingInfo})

const newOrder = newCompany.createOrder({orderId: 1234, origin: 'Basel', destination: 'Zurich', customerId: customer1.id, deliveryDate: '2026-04-12', state: 'Ready to pick-up', billingInfo})

const orderFromCustomer1 = customer1.placeOrder(newCompany, {orderId: 1122,  origin: 'Geneva', destination: 'Lausanne', deliveryDate: '2026-08-15', state: 'Pending', billingInfo: billingInfo})

newVehicle.loadCargo(newCargo)

newCompany.addVehicle(anotherVehicle)
newCompany.addVehicle(newAnotherVehicle)



console.log('Customer placed order:', orderFromCustomer1.orderId, orderFromCustomer1.customerName)

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
