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

const updateOrder = async(orderId, updateData) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    if (order.state !== 'PENDING') {
        throw new Error('Order can only be updated while pending')
    }

    Object.assign(order, updateData)
    return order.save()
}

const deleteOrderByCustomer = async(orderId) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    if (order.state !== 'PENDING') {
        throw new Error('Customer can only delete orders in Pending')
    }
    return Order.findByIdAndDelete(orderId)
}

const deleteOrderByCompany = async(orderId) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    if (order.state === 'DELIVERED') {
        throw new Error('Delivered orders cannot be deleted')
    }
    return Order.findByIdAndDelete(orderId)
}

module.exports = { 
    createOrder, 
    getOrders, 
    findOrderById, 
    getOrdersByCustomer, 
    getOrdersByCompany, 
    updateOrder,
    deleteOrderByCustomer,
    deleteOrderByCompany
 }