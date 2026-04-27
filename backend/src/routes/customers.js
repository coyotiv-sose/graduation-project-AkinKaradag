const express = require('express')

const router = express.Router()
const orderManager = require('../managers/order-manager')
const generateOrder = require('../lib/order-generator')
const { forwardRouteError } = require('../lib/route-error-forwarding')
const requireRole = require('../middlewares/require-role')
const { requireCustomerAccess, requireOrderAccess } = require('../middlewares/require-access')
const {
  validateCustomerIdParam,
  validateCustomerOrderParams,
  validateCreateCustomerOrder,
  validateGenerateCustomerOrder,
  validateAddCargoToOrder,
} = require('./validations/customers-validation')

const customerAccess = requireCustomerAccess()
const customerOrderAccess = requireOrderAccess({ customerParamName: 'customerId' })

router.use(requireRole('admin', 'employee', 'customer'))

router.get('/:customerId', validateCustomerIdParam, customerAccess, async (req, res, next) => {
  try {
    const customer = req.authz?.customer
    return res.json(customer)
  } catch (error) {
    return forwardRouteError(next, error)
  }
})

router.post('/:customerId/orders', validateCreateCustomerOrder, customerAccess, async (req, res, next) => {
  try {
    const customer = req.authz?.customer

    const newOrder = await orderManager.createOrder({
      ...req.body,
      customer: customer._id,
      company: customer.company,
    })
    req.app.io.to(`company:${customer.company}`).to(`customer:${customer._id}`).emit('order:created', newOrder)
    return res.status(201).json(newOrder)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.post(
  '/:customerId/orders/ai-generate',
  validateGenerateCustomerOrder,
  customerAccess,
  async (req, res, next) => {
    try {
      const { prompt, billingInfo: providedBillingInfo } = req.body
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' })
      }

      const customer = req.authz?.customer

      const orderData = await generateOrder(prompt)

      const billingInfo =
        providedBillingInfo || customer.billingInfo?.find(b => b.isDefault) || customer.billingInfo?.[0]
      if (!billingInfo) {
        return res.status(400).json({ error: 'Customer has no billing info' })
      }

      const newOrder = await orderManager.createOrder({
        ...orderData,
        customer: customer._id,
        company: customer.company,
        billingInfo,
      })

      req.app.io.to(`company:${customer.company}`).to(`customer:${customer._id}`).emit('order:created', newOrder)
      return res.status(201).json(newOrder)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.get('/:customerId/orders', validateCustomerIdParam, customerAccess, async (req, res, next) => {
  try {
    const orders = await orderManager.getOrdersByCustomer(req.params.customerId)
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
})

router.get('/:customerId/orders/:orderId', validateCustomerOrderParams, customerOrderAccess, async (req, res, next) => {
  try {
    const order = req.authz?.order
    return res.status(200).json(order)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.delete(
  '/:customerId/orders/:orderId',
  validateCustomerOrderParams,
  customerOrderAccess,
  async (req, res, next) => {
    try {
      const order = await orderManager.deleteOrderByCustomer(req.params.orderId, req.params.customerId)
      req.app.io
        .to(`company:${order.company}`)
        .to(`customer:${req.params.customerId}`)
        .emit('order:deleted', { orderId: order._id })
      return res.status(204).send()
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.post(
  '/:customerId/orders/:orderId/cargos',
  validateAddCargoToOrder,
  customerOrderAccess,
  async (req, res, next) => {
    try {
      const addCargo = await orderManager.addCargoToOrder(req.params.orderId, req.body)
      return res.status(201).json(addCargo)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

module.exports = router
