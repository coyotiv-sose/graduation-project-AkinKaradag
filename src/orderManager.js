const Order = require('./order')

const orders = []

function createOrder({ orderId, origin, destination, customerId, deliveryDate, state, billingInfo, companyId }) {
    const newOrder = new Order({ orderId, origin, destination, customerId, deliveryDate, state, billingInfo, companyId })
    orders.push(newOrder)
    return newOrder
}

function getOrders() {
    return orders
}

module.exports = { createOrder, getOrders }