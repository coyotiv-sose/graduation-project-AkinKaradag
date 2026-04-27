const Order = require('../models/order')
const { validateCustomerBelongsToCompany } = require('./customer-manager')

const ORDER_MUTABLE_FIELDS = ['origin', 'destination', 'deliveryDate', 'state', 'cargos', 'billingInfo', 'note']

const pickAllowedFields = (payload, allowedFields) =>
  Object.fromEntries(Object.entries(payload || {}).filter(([key]) => allowedFields.includes(key)))

const createOrder = async orderData => {
  if (!orderData.cargos || orderData.cargos.length === 0) {
    throw new Error('Order must contain at least one cargo')
  }

  const newOrder = await Order.create(orderData)
  return newOrder
}

const findOrderById = async orderId => {
  const order = await Order.findById(orderId).populate('customer', 'customerName')
  if (!order) throw new Error('Order not found')
  return order
}

const getOrdersByIdsWithCustomer = async orderIds => {
  return Order.find({ _id: { $in: orderIds } }).populate('customer', 'customerName')
}

const getOrders = () => Order.find()

const getOrdersByCustomer = customerId => Order.find({ customer: customerId })

const getOrdersByCompany = companyId => Order.find({ company: companyId })

const getOrdersByCustomerFromCompany = async (customerId, companyId) => {
  await validateCustomerBelongsToCompany(customerId, companyId)
  return Order.find({ customer: customerId })
}

const updateOrder = async (orderId, updateData) => {
  const allowedUpdates = pickAllowedFields(updateData, ORDER_MUTABLE_FIELDS)
  if (!Object.keys(allowedUpdates).length) {
    throw new Error('No valid order fields to update')
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, state: 'PENDING' },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  )

  if (!order) {
    const exists = await Order.findById(orderId)
    if (!exists) throw new Error('Order not found')
    throw new Error('Order status is not pending')
  }
  return order
}

const deleteOrderByCustomer = async (orderId, customerId) => {
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

const deleteOrderByCompany = async (orderId, companyId) => {
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

const addCargoToOrder = async (orderId, cargo) => {
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  return order.addCargo(cargo)
}

const getCargosFromOrder = async orderId => {
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  return order.getCargos()
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
  getOrdersByCustomerFromCompany,
  addCargoToOrder,
  getCargosFromOrder,
  getOrdersByIdsWithCustomer,
}
