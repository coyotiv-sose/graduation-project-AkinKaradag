const BillingInfo = require("./billingInfo")

class Order {
  constructor(orderId, origin, destination, customer, deliveryDate, state) {
    this.orderId = orderId
    this.origin = origin
    this.destination = destination
    this.customer = customer
    this.deliveryDate = deliveryDate
    this.state = state
    this.cargos = []
    this.billingInfo = new BillingInfo(
      customer.billingInfo.customerName,
      customer.billingInfo.address,
      customer.billingInfo.postalCode,
      customer.billingInfo.city,
      customer.billingInfo.VATnr
    )
  }

  addCargo(cargo) {
    this.cargos.push(cargo)
  }

  getCargos() {
    return this.cargos
  }

}

module.exports = Order