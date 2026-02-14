const Order = require('../models/order')

const createOrder = async orderData => {
    if (!orderData.cargos || orderData.cargos.length === 0) {
        throw new Error('Order must contain at least one cargo')
    }

    const newOrder = await Order.create(orderData)
    return newOrder
}

const findOrderById = async orderId => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    return order
}

const getOrders = () => Order.find()

const getOrdersByCustomer = customerId => Order.find({ customer: customerId })

const getOrdersByCompany = companyId => Order.find({ company: companyId })

module.exports = { createOrder, getOrders, findOrderById, getOrdersByCustomer, getOrdersByCompany }