const express = require('express')

const router = express.Router()
const orderManager = require('../managers/order-manager')
const requireRole = require('../middlewares/require-role')
const { requireOrderAccess } = require('../middlewares/require-access')
const { forwardRouteError } = require('../lib/route-error-forwarding')
const { validateOrderIdParam, validateUpdateOrder } = require('./validations/orders-validation')

const orderAccess = requireOrderAccess()

router.use(requireRole('admin', 'employee', 'customer'))

router.get('/:orderId', validateOrderIdParam, orderAccess, async (req, res, next) => {
  try {
    const order = req.authz?.order || (await orderManager.findOrderById(req.params.orderId))
    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
})

router.put('/:orderId', validateUpdateOrder, orderAccess, async (req, res, next) => {
  try {
    const order = await orderManager.updateOrder(req.params.orderId, req.body)
    req.app.io
      .to(`customer:${order.customer}`)
      .to(`company:${order.company}`)
      .to(`order:${order._id}`)
      .emit('order:updated', order)
    return res.status(200).json(order)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.get('/:orderId/cargos', validateOrderIdParam, orderAccess, async (req, res, next) => {
  try {
    const cargos = await orderManager.getCargosFromOrder(req.params.orderId)
    return res.status(200).json(cargos)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

module.exports = router
