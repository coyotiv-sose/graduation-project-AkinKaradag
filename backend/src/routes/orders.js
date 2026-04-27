const express = require('express')

const router = express.Router()
const orderManager = require('../managers/order-manager')
const { validateOrderIdParam, validateUpdateOrder } = require('./validations/orders-validation')

router.get('/:orderId', validateOrderIdParam, async (req, res, next) => {
  try {
    const order = await orderManager.findOrderById(req.params.orderId)
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
})

router.put('/:orderId', validateUpdateOrder, async (req, res, next) => {
  try {
    const order = await orderManager.updateOrder(req.params.orderId, req.body)
    req.app.io
      .to(`customer:${order.customer}`)
      .to(`company:${order.company}`)
      .to(`order:${order._id}`)
      .emit('order:updated', order)
    res.status(200).json(order)
  } catch (error) {
    const status = error.message === 'Order not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.get('/:orderId/cargos', validateOrderIdParam, async (req, res, next) => {
  try {
    const cargos = await orderManager.getCargosFromOrder(req.params.orderId)
    res.status(200).json(cargos)
  } catch (error) {
    const status = error.message === 'Order not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

module.exports = router
