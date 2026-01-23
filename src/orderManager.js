const Order = require('./order')

const orders = []

function createOrder({orderId, origin, destination, customerId, deliveryDate, state, billingInfo}){
    const newOrder = new Order(orderId, origin, destination, customerId, deliveryDate, state, billingInfo)
    orders.push(newOrder)
    return orders
}

function getOrders(){
    return orders
}

module.exports = {createOrder, getOrders}