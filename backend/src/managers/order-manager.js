const Order = require('../models/order')
const { validateCustomerBelongsToCompany } = require('./customer-manager')
const { DomainError } = require('../lib/domain-error')
const { pickAllowedFields } = require('../lib/object-utils')

const ORDER_MUTABLE_FIELDS = ['origin', 'destination', 'deliveryDate', 'state', 'cargos', 'billingInfo', 'note']

const orderNotFound = () => new DomainError('Order not found', { status: 404 })

const createOrder = async orderData => {
  if (!orderData.cargos || orderData.cargos.length === 0) {
    throw new DomainError('Order must contain at least one cargo', { status: 400 })
  }

  const newOrder = await Order.create(orderData)
  return newOrder
}

const findOrderById = async orderId => {
  const order = await Order.findById(orderId).populate('customer', 'customerName')
  if (!order) throw orderNotFound()
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
    throw new DomainError('No valid order fields to update', { status: 400 })
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, state: 'PENDING' },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  )

  if (!order) {
    const exists = await Order.findById(orderId)
    if (!exists) throw orderNotFound()
    throw new DomainError('Order status is not pending', { status: 409 })
  }
  return order
}

const deleteOrderByCustomer = async (orderId, customerId) => {
  const order = await Order.findById(orderId)
  if (!order) throw orderNotFound()
  if (order.customer.toString() !== customerId) {
    throw new DomainError('Not authorized to delete this order', { status: 403 })
  }
  if (order.state !== 'PENDING') {
    throw new DomainError('Order status is not pending', { status: 409 })
  }
  await Order.findByIdAndDelete(orderId)
  return order
}

const deleteOrderByCompany = async (orderId, companyId) => {
  const order = await Order.findById(orderId)
  if (!order) throw orderNotFound()
  if (order.company.toString() !== companyId) {
    throw new DomainError('Not authorized to delete this order', { status: 403 })
  }
  if (order.state === 'DELIVERED') {
    throw new DomainError('Delivered orders cannot be deleted', { status: 409 })
  }
  await Order.findByIdAndDelete(orderId)
  return order
}

const addCargoToOrder = async (orderId, cargo) => {
  const order = await Order.findById(orderId)
  if (!order) throw orderNotFound()
  return order.addCargo(cargo)
}

const getCargosFromOrder = async orderId => {
  const order = await Order.findById(orderId)
  if (!order) throw orderNotFound()
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
