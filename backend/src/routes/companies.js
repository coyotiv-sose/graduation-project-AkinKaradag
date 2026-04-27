/* eslint-disable consistent-return */
const express = require('express')

const router = express.Router()
const companyManager = require('../managers/company-manager')

const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const orderManager = require('../managers/order-manager')
const vehicleManager = require('../managers/vehicle-manager')
const tourManager = require('../managers/tour-manager')
const { forwardRouteError } = require('../lib/route-error-forwarding')
const requireRole = require('../middlewares/require-role')
const {
  requireCompanyAccess,
  requireCustomerAccess,
  requireEmployeeAccess,
  requireOrderAccess,
  requireVehicleAccess,
  requireTourAccess,
  requireBodyCustomerInCompany,
  requireBodyOrderInCompany,
  requireBodyVehicleInCompany,
} = require('../middlewares/require-access')
const {
  validateCompanyIdParam,
  validateCompanyCustomerParams,
  validateCompanyEmployeeParams,
  validateCompanyOrderParams,
  validateCreateCompanyCustomer,
  validateUpdateCompanyCustomer,
  validateCreateCompanyEmployee,
  validateUpdateCompanyEmployee,
  validateCreateCompanyOrder,
  validateCreateCompanyVehicle,
  validateUpdateCompanyVehicle,
  validateCreateCompanyTour,
  validateAddOrderToTour,
  validateUpdateCompanyTour,
  validateCompanyCustomerPasswordReset,
  validateCompanyEmployeePasswordReset,
} = require('./validations/companies-validation')

const companyAccess = requireCompanyAccess()
const withCompanyScope = (...middlewares) => [companyAccess, ...middlewares]
const withCompanyAccess = withCompanyScope()
const withCompanyCustomerAccess = withCompanyScope(requireCustomerAccess({ companyParamName: 'companyId' }))
const withCompanyEmployeeAccess = withCompanyScope(requireEmployeeAccess({ companyParamName: 'companyId' }))
const withCompanyOrderAccess = withCompanyScope(requireOrderAccess({ companyParamName: 'companyId' }))
const withCompanyVehicleAccess = withCompanyScope(requireVehicleAccess({ companyParamName: 'companyId' }))
const withCompanyBodyCustomerAccess = withCompanyScope(requireBodyCustomerInCompany())
const withCompanyBodyVehicleAccess = withCompanyScope(requireBodyVehicleInCompany({ vehicleField: 'vehicle' }))
const withCompanyTourOrderAccess = withCompanyScope(
  requireTourAccess({ companyParamName: 'companyId' }),
  requireBodyOrderInCompany()
)
const withCompanyTourVehicleUpdateAccess = withCompanyScope(
  requireTourAccess({ companyParamName: 'companyId' }),
  requireBodyVehicleInCompany({ vehicleFields: ['vehicle', 'vehicleId'] })
)

router.use(requireRole('admin', 'employee'))

// ---- Company detail ----

// eslint-disable-next-line consistent-return
router.get('/:companyId', validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const company = await companyManager.getCompanyById(req.params.companyId)
    if (!company) return res.status(404).json({ error: 'Company not found' })
    res.status(200).json(company)
  } catch (error) {
    next(error)
  }
})

// ---- Customers ----

router.post('/:companyId/customers', validateCreateCompanyCustomer, ...withCompanyAccess, async (req, res, next) => {
  try {
    const customer = await customerManager.createCustomer({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(customer)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.get('/:companyId/customers', validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const customers = await customerManager.getCustomerByCompany(req.params.companyId)
    res.status(200).json(customers)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:companyId/customers/:customerId',
  validateUpdateCompanyCustomer,
  ...withCompanyCustomerAccess,
  async (req, res, next) => {
    try {
      const customer = await customerManager.updateCustomerByCompany(
        req.params.customerId,
        req.params.companyId,
        req.body
      )
      res.status(200).json(customer)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.delete(
  '/:companyId/customers/:customerId',
  validateCompanyCustomerParams,
  ...withCompanyCustomerAccess,
  async (req, res, next) => {
    try {
      await customerManager.deleteCustomerByCompany(req.params.customerId, req.params.companyId)
      res.status(204).send()
    } catch (error) {
      return forwardRouteError(next, error, 500)
    }
  }
)

router.post(
  '/:companyId/customers/:customerId/reset-password',
  validateCompanyCustomerPasswordReset,
  ...withCompanyCustomerAccess,
  async (req, res, next) => {
    try {
      await customerManager.resetCustomerPasswordByCompany(
        req.params.customerId,
        req.params.companyId,
        req.body.newPassword
      )
      res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

// ---- Employees ----

router.post('/:companyId/employees', validateCreateCompanyEmployee, ...withCompanyAccess, async (req, res, next) => {
  try {
    const employee = await employeeManager.createEmployee({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(employee)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.get('/:companyId/employees', validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const employees = await employeeManager.getEmployeeByCompany(req.params.companyId)
    res.status(200).json(employees)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:companyId/employees/:employeeId',
  validateUpdateCompanyEmployee,
  ...withCompanyEmployeeAccess,
  async (req, res, next) => {
    try {
      const employee = await employeeManager.updateEmployeeByCompany(
        req.params.employeeId,
        req.params.companyId,
        req.body
      )
      res.status(200).json(employee)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.delete(
  '/:companyId/employees/:employeeId',
  validateCompanyEmployeeParams,
  ...withCompanyEmployeeAccess,
  async (req, res, next) => {
    try {
      await employeeManager.deleteEmployeeByCompany(req.params.employeeId, req.params.companyId)
      res.status(204).send()
    } catch (error) {
      return forwardRouteError(next, error, 500)
    }
  }
)

router.post(
  '/:companyId/employees/:employeeId/reset-password',
  validateCompanyEmployeePasswordReset,
  ...withCompanyEmployeeAccess,
  async (req, res, next) => {
    try {
      await employeeManager.resetEmployeePasswordByCompany(
        req.params.employeeId,
        req.params.companyId,
        req.body.newPassword
      )
      res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

// ---- Orders ----

router.post(
  '/:companyId/orders',
  validateCreateCompanyOrder,
  ...withCompanyBodyCustomerAccess,
  async (req, res, next) => {
    try {
      const newOrder = await orderManager.createOrder({
        ...req.body,
        company: req.params.companyId,
      })
      req.app.io
        .to(`company:${req.params.companyId}`)
        .to(`customer:${newOrder.customer}`)
        .emit('order:created', newOrder)
      res.status(201).json(newOrder)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.get('/:companyId/orders', validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const orders = await orderManager.getOrdersByCompany(req.params.companyId)
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
})

router.delete(
  '/:companyId/orders/:orderId',
  validateCompanyOrderParams,
  ...withCompanyOrderAccess,
  async (req, res, next) => {
    try {
      const order = await orderManager.deleteOrderByCompany(req.params.orderId, req.params.companyId)
      req.app.io
        .to(`customer:${order.customer}`)
        .to(`company:${req.params.companyId}`)
        .emit('order:deleted', { orderId: order._id })
      res.status(204).send()
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.get(
  '/:companyId/customers/:customerId/orders',
  validateCompanyCustomerParams,
  ...withCompanyCustomerAccess,
  async (req, res, next) => {
    try {
      const ordersFromCustomer = await orderManager.getOrdersByCustomerFromCompany(
        req.params.customerId,
        req.params.companyId
      )
      res.status(200).json(ordersFromCustomer)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.post('/:companyId/vehicles', validateCreateCompanyVehicle, ...withCompanyAccess, async (req, res, next) => {
  try {
    const newVehicle = await vehicleManager.createVehicle({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(newVehicle)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.get('/:companyId/vehicles', validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const vehicles = await vehicleManager.getAllVehiclesOfCompany(req.params.companyId)
    res.status(200).json(vehicles)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:companyId/vehicles/:vehicleId',
  validateUpdateCompanyVehicle,
  ...withCompanyVehicleAccess,
  async (req, res, next) => {
    try {
      const vehicle = await vehicleManager.updateVehicle(req.params.vehicleId, req.body)
      res.status(200).json(vehicle)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.post('/:companyId/tours', validateCreateCompanyTour, ...withCompanyBodyVehicleAccess, async (req, res, next) => {
  try {
    const newTour = await tourManager.createTour({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(newTour)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

router.get('/:companyId/tours', validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const tours = await tourManager.getAllToursByCompany(req.params.companyId)
    res.status(200).json(tours)
  } catch (error) {
    next(error)
  }
})

router.post(
  '/:companyId/tours/:tourId',
  validateAddOrderToTour,
  ...withCompanyTourOrderAccess,
  async (req, res, next) => {
    try {
      const newOrder = await tourManager.addOrderToTour(req.params.tourId, req.body.orderId)
      res.status(200).json(newOrder)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

router.put(
  '/:companyId/tours/:tourId',
  validateUpdateCompanyTour,
  ...withCompanyTourVehicleUpdateAccess,
  async (req, res, next) => {
    try {
      const tour = await tourManager.updateTour(req.params.tourId, req.body)

      if (req.body.state === 'STARTED' || req.body.state === 'FINISHED') {
        const orderIds = tour.orders.map(o => o._id || o)
        const updatedOrders = await orderManager.getOrdersByIdsWithCustomer(orderIds)

        updatedOrders.forEach(order => {
          req.app.io
            .to(`customer:${order.customer._id || order.customer}`)
            .to(`order:${order._id}`)
            .emit('order:updated', order)
        })
        req.app.io.to(`company:${req.params.companyId}`).emit('orders:refresh')
      }

      res.status(200).json(tour)
    } catch (error) {
      return forwardRouteError(next, error, 400)
    }
  }
)

module.exports = router
