const express = require('express')

const router = express.Router()
const orderManager = require('../managers/order-manager')

router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await orderManager.findOrderById(req.params.orderId)
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:orderId', async (req, res, next) => {
  try {
    const order = await orderManager.updateOrder(req.params.orderId, req.body)
    res.status(200).json(order)
  } catch (error) {
    const status = error.message === 'Order not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

module.exports = router
