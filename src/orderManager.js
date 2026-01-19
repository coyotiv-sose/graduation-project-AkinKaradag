const Order = require('./order')

const orders = []

function createOrder({orderId, origin, destination, customer, deliveryDate, state}){
    const newOrder = new Order(orderId, origin, destination, customer, deliveryDate, state)
    orders.push(newOrder)
    return orders
}

function getOrders(){
    return orders
}

module.exports = {createOrder, getOrders}