const Order = require('./order')
const Cargo = require('./cargo')

const orders = []

function createOrder(orderData) {
    if (!orderData.cargos || orderData.cargo.length === 0) {
        throw new Error('Order must contain at least one cargo')
    }

    const newOrder = new Order(orderData)
    for (let i = 0; i < orderData.cargos.length; i++) {
        const cargo = Cargo.create(orderData.cargos[i])
        newOrder.addCargo(cargo)
    }
    orders.push(newOrder)
    return newOrder
}

function findOrderById(orderId) {
    return orders.find(order => order.orderId === orderId)
}

function getOrders() {
    return orders
}

module.exports = { createOrder, getOrders, findOrderById }