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
    const order = await Order.findOneAndUpdate({ _id: orderId, state: 'PENDING' }, { $set: updateData }, { new: true, runValidators: true })

    if (!order) {
        const exists = await Order.findById(orderId)
        if (!exists) throw new Error('Order not found')
        throw new Error('Order status is not pending')
    }
    return order
}

const deleteOrderByCustomer = async(orderId, customerId) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    if (order.customer.toString() !== customerId) {
        throw new Error('Not authorized to delete this order')
    }
    if (order.state !== 'PENDING') {
        throw new Error('Order status is not pending')
    }
    await Order.findByIdAndDelete(orderId)
    return order
}

const deleteOrderByCompany = async(orderId, companyId) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    if (order.company.toString() !== companyId) {
        throw new Error('Not authorized to delete this order')
    }
    if (order.state === 'DELIVERED') {
        throw new Error('Delivered orders cannot be deleted')
    }
    await Order.findByIdAndDelete(orderId)
    return order
}

module.exports = {
    createOrder,
    getOrders,
    findOrderById,
    getOrdersByCustomer,
    getOrdersByCompany,
    updateOrder,
    deleteOrderByCustomer,
    deleteOrderByCompany,
}