const express = require('express')

const router = express.Router()
const companyManager = require('../managers/company-manager')
const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const orderManager = require('../managers/order-manager')
const vehicleManager = require('../managers/vehicle-manager')
const tourManager = require('../managers/tour-manager')
const requireRole = require('../middlewares/require-role')
const access = require('../middlewares/require-access')
const validate = require('./validations/companies-validation')

const companyAccess = access.requireCompanyAccess()
const withCompanyScope = (...middlewares) => [companyAccess, ...middlewares]
const withCompanyAccess = withCompanyScope()
const withCompanyCustomerAccess = withCompanyScope(access.requireCustomerAccess({ companyParamName: 'companyId' }))
const withCompanyEmployeeAccess = withCompanyScope(access.requireEmployeeAccess({ companyParamName: 'companyId' }))
const withCompanyOrderAccess = withCompanyScope(access.requireOrderAccess({ companyParamName: 'companyId' }))
const withCompanyVehicleAccess = withCompanyScope(access.requireVehicleAccess({ companyParamName: 'companyId' }))
const withCompanyBodyCustomerAccess = withCompanyScope(access.requireBodyCustomerInCompany())
const withCompanyBodyVehicleAccess = withCompanyScope(access.requireBodyVehicleInCompany({ vehicleField: 'vehicle' }))
const withCompanyTourOrderAccess = withCompanyScope(
  access.requireTourAccess({ companyParamName: 'companyId' }),
  access.requireBodyOrderInCompany()
)
const withCompanyTourVehicleUpdateAccess = withCompanyScope(
  access.requireTourAccess({ companyParamName: 'companyId' }),
  access.requireBodyVehicleInCompany({ vehicleFields: ['vehicle', 'vehicleId'] })
)

router.use(requireRole('admin', 'employee'))

// ---- Company detail ----

router.get('/:companyId', validate.validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const company = await companyManager.getCompanyById(req.params.companyId)
    res.status(200).json(company)
  } catch (error) {
    next(error)
  }
})

// ---- Customers ----

router.post(
  '/:companyId/customers',
  validate.validateCreateCompanyCustomer,
  ...withCompanyAccess,
  async (req, res, next) => {
    try {
      const customer = await customerManager.createCustomer({
        ...req.body,
        company: req.params.companyId,
      })
      res.status(201).json(customer)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:companyId/customers',
  validate.validateCompanyIdParam,
  ...withCompanyAccess,
  async (req, res, next) => {
    try {
      const customers = await customerManager.getCustomerByCompany(req.params.companyId)
      res.status(200).json(customers)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:companyId/customers/:customerId',
  validate.validateUpdateCompanyCustomer,
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
      next(error)
    }
  }
)

router.delete(
  '/:companyId/customers/:customerId',
  validate.validateCompanyCustomerParams,
  ...withCompanyCustomerAccess,
  async (req, res, next) => {
    try {
      await customerManager.deleteCustomerByCompany(req.params.customerId, req.params.companyId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/:companyId/customers/:customerId/reset-password',
  validate.validateCompanyCustomerPasswordReset,
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
      next(error)
    }
  }
)

// ---- Employees ----

router.post(
  '/:companyId/employees',
  validate.validateCreateCompanyEmployee,
  ...withCompanyAccess,
  async (req, res, next) => {
    try {
      const employee = await employeeManager.createEmployee({
        ...req.body,
        company: req.params.companyId,
      })
      res.status(201).json(employee)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:companyId/employees',
  validate.validateCompanyIdParam,
  ...withCompanyAccess,
  async (req, res, next) => {
    try {
      const employees = await employeeManager.getEmployeeByCompany(req.params.companyId)
      res.status(200).json(employees)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:companyId/employees/:employeeId',
  validate.validateUpdateCompanyEmployee,
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
      next(error)
    }
  }
)

router.delete(
  '/:companyId/employees/:employeeId',
  validate.validateCompanyEmployeeParams,
  ...withCompanyEmployeeAccess,
  async (req, res, next) => {
    try {
      await employeeManager.deleteEmployeeByCompany(req.params.employeeId, req.params.companyId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/:companyId/employees/:employeeId/reset-password',
  validate.validateCompanyEmployeePasswordReset,
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
      next(error)
    }
  }
)

// ---- Orders ----

router.post(
  '/:companyId/orders',
  validate.validateCreateCompanyOrder,
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
      next(error)
    }
  }
)

router.get('/:companyId/orders', validate.validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const orders = await orderManager.getOrdersByCompany(req.params.companyId)
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
})

router.delete(
  '/:companyId/orders/:orderId',
  validate.validateCompanyOrderParams,
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
      next(error)
    }
  }
)

router.get(
  '/:companyId/customers/:customerId/orders',
  validate.validateCompanyCustomerParams,
  ...withCompanyCustomerAccess,
  async (req, res, next) => {
    try {
      const ordersFromCustomer = await orderManager.getOrdersByCustomerFromCompany(
        req.params.customerId,
        req.params.companyId
      )
      res.status(200).json(ordersFromCustomer)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/:companyId/vehicles',
  validate.validateCreateCompanyVehicle,
  ...withCompanyAccess,
  async (req, res, next) => {
    try {
      const newVehicle = await vehicleManager.createVehicle({
        ...req.body,
        company: req.params.companyId,
      })
      res.status(201).json(newVehicle)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:companyId/vehicles',
  validate.validateCompanyIdParam,
  ...withCompanyAccess,
  async (req, res, next) => {
    try {
      const vehicles = await vehicleManager.getAllVehiclesOfCompany(req.params.companyId)
      res.status(200).json(vehicles)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:companyId/vehicles/:vehicleId',
  validate.validateUpdateCompanyVehicle,
  ...withCompanyVehicleAccess,
  async (req, res, next) => {
    try {
      const vehicle = await vehicleManager.updateVehicle(req.params.vehicleId, req.body)
      res.status(200).json(vehicle)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/:companyId/tours',
  validate.validateCreateCompanyTour,
  ...withCompanyBodyVehicleAccess,
  async (req, res, next) => {
    try {
      const newTour = await tourManager.createTour({
        ...req.body,
        company: req.params.companyId,
      })
      res.status(201).json(newTour)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/:companyId/tours', validate.validateCompanyIdParam, ...withCompanyAccess, async (req, res, next) => {
  try {
    const tours = await tourManager.getAllToursByCompany(req.params.companyId)
    res.status(200).json(tours)
  } catch (error) {
    next(error)
  }
})

router.post(
  '/:companyId/tours/:tourId',
  validate.validateAddOrderToTour,
  ...withCompanyTourOrderAccess,
  async (req, res, next) => {
    try {
      const newOrder = await tourManager.addOrderToTour(req.params.tourId, req.body.orderId)
      res.status(200).json(newOrder)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:companyId/tours/:tourId',
  validate.validateUpdateCompanyTour,
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
      next(error)
    }
  }
)

module.exports = router
