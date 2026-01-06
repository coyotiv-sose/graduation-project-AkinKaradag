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

module.exports = Order