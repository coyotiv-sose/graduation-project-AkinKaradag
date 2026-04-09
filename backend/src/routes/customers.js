const express = require('express')

const router = express.Router()
const customerManager = require('../managers/customer-manager')
const orderManager = require('../managers/order-manager')
const generateOrder = require('../lib/order-generator')

router.get('/:customerId', async (req, res, next) => {
  try {
    const customer = await customerManager.getCustomerById(req.params.customerId)
    res.json(customer)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/:customerId/orders', async (req, res, next) => {
  try {
    const customer = await customerManager.getCustomerById(req.params.customerId)

    const newOrder = await orderManager.createOrder({
      ...req.body,
      customer: customer._id,
      company: customer.company,
    })
    req.app.io.to(`company:${customer.company}`).emit('order:created', newOrder)
    req.app.io.to(`customer:${customer._id}`).emit('order:created', newOrder)
    res.status(201).json(newOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/:customerId/orders/ai-generate', async (req, res, next) => {
  try {
    const { prompt } = req.body
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const customer = await customerManager.getCustomerById(req.params.customerId)

    const orderData = await generateOrder(prompt)

    const billingInfo = customer.billingInfo?.find(b => b.isDefault) || customer.billingInfo?.[0]
    if (!billingInfo) {
      return res.status(400).json({ error: 'Customer has no billing info' })
    }

    const newOrder = await orderManager.createOrder({
      ...orderData,
      customer: customer._id,
      company: customer.company,
      billingInfo,
    })

    req.app.io.to(`company:${customer.company}`).emit('order:created', newOrder)
    req.app.io.to(`customer:${customer._id}`).emit('order:created', newOrder)
    res.status(201).json(newOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:customerId/orders', async (req, res, next) => {
  try {
    const orders = await orderManager.getOrdersByCustomer(req.params.customerId)
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:customerId/orders/:orderId', async (req, res, next) => {
  try {
    const order = await orderManager.findOrderById(req.params.orderId)
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:customerId/orders/:orderId', async (req, res, next) => {
  try {
    const order = await orderManager.deleteOrderByCustomer(req.params.orderId, req.params.customerId)
    req.app.io.to(`company:${order.company}`).emit('order:deleted', { orderId: order._id })
    req.app.io.to(`customer:${req.params.customerId}`).emit('order:deleted', { orderId: order._id })
    res.status(204).send()
  } catch (error) {
    const status = error.message === 'Order not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.post('/:customerId/orders/:orderId/cargos', async (req, res, next) => {
  try {
    const addCargo = await orderManager.addCargoToOrder(req.params.orderId, req.body)
    res.status(201).json(addCargo)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
