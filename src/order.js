const BillingInfo = require("./billingInfo")

class Order {
    constructor({ orderId, origin, destination, customerId, deliveryDate, state, billingInfo, companyId }) {
        this.orderId = orderId
        this.origin = origin
        this.destination = destination
        this.customerId = customerId
        this.companyId = companyId
        this.deliveryDate = deliveryDate
        this.state = state
        this.cargos = []
        this.billingInfo = billingInfo
    }

    addCargo(cargo) {
        this.cargos.push(cargo)
    }

    getCargos() {
        return this.cargos
    }

}

module.exports = Order