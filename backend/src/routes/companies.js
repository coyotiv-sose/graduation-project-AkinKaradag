/* eslint-disable consistent-return */
const express = require('express')

const router = express.Router()
const companyManager = require('../managers/company-manager')

const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const orderManager = require('../managers/order-manager')
const vehicleManager = require('../managers/vehicle-manager')
const tourManager = require('../managers/tour-manager')

// ---- Company detail ----

// eslint-disable-next-line consistent-return
router.get('/:companyId', async (req, res, next) => {
  try {
    const company = await companyManager.getCompanyById(req.params.companyId)
    if (!company) return res.status(404).json({ error: 'Company not found' })
    res.status(200).json(company)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Customers ----

router.post('/:companyId/customers', async (req, res, next) => {
  try {
    const customer = await customerManager.createCustomer({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(customer)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:companyId/customers', async (req, res, next) => {
  try {
    const customers = await customerManager.getCustomerByCompany(req.params.companyId)
    res.status(200).json(customers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:companyId/customers/:customerId', async (req, res, next) => {
  try {
    const customer = await customerManager.updateCustomerByCompany(
      req.params.customerId,
      req.params.companyId,
      req.body
    )
    res.status(200).json(customer)
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.delete('/:companyId/customers/:customerId', async (req, res, next) => {
  try {
    await customerManager.deleteCustomerByCompany(req.params.customerId, req.params.companyId)
    res.status(204).send()
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500
    res.status(status).json({ error: error.message })
  }
})

router.post('/:companyId/customers/:customerId/reset-password', async (req, res, next) => {
  try {
    await customerManager.resetCustomerPasswordByCompany(
      req.params.customerId,
      req.params.companyId,
      req.body.newPassword
    )
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

// ---- Employees ----

router.post('/:companyId/employees', async (req, res, next) => {
  try {
    const employee = await employeeManager.createEmployee({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(employee)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:companyId/employees', async (req, res, next) => {
  try {
    const employees = await employeeManager.getEmployeeByCompany(req.params.companyId)
    res.status(200).json(employees)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:companyId/employees/:employeeId', async (req, res, next) => {
  try {
    const employee = await employeeManager.updateEmployeeByCompany(
      req.params.employeeId,
      req.params.companyId,
      req.body
    )
    res.status(200).json(employee)
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.delete('/:companyId/employees/:employeeId', async (req, res, next) => {
  try {
    await employeeManager.deleteEmployeeByCompany(req.params.employeeId, req.params.companyId)
    res.status(204).send()
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500
    res.status(status).json({ error: error.message })
  }
})

router.post('/:companyId/employees/:employeeId/reset-password', async (req, res, next) => {
  try {
    await employeeManager.resetEmployeePasswordByCompany(
      req.params.employeeId,
      req.params.companyId,
      req.body.newPassword
    )
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

// ---- Orders ----

router.post('/:companyId/orders', async (req, res, next) => {
  try {
    const newOrder = await orderManager.createOrder({
      ...req.body,
      company: req.params.companyId,
    })
    req.app.io.to(`company:${req.params.companyId}`).to(`customer:${newOrder.customer}`).emit('order:created', newOrder)
    res.status(201).json(newOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:companyId/orders', async (req, res, next) => {
  try {
    const orders = await orderManager.getOrdersByCompany(req.params.companyId)
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:companyId/orders/:orderId', async (req, res, next) => {
  try {
    const order = await orderManager.deleteOrderByCompany(req.params.orderId, req.params.companyId)
    req.app.io
      .to(`customer:${order.customer}`)
      .to(`company:${req.params.companyId}`)
      .emit('order:deleted', { orderId: order._id })
    res.status(204).send()
  } catch (error) {
    const status = error.message === 'Order not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.get('/:companyId/customers/:customerId/orders', async (req, res, next) => {
  try {
    const ordersFromCustomer = await orderManager.getOrdersByCustomerFromCompany(
      req.params.customerId,
      req.params.companyId
    )
    res.status(200).json(ordersFromCustomer)
  } catch (error) {
    const status = error.message === 'Customer not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.post('/:companyId/vehicles', async (req, res, next) => {
  try {
    const newVehicle = await vehicleManager.createVehicle({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(newVehicle)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:companyId/vehicles', async (req, res, next) => {
  try {
    const vehicles = await vehicleManager.getAllVehiclesOfCompany(req.params.companyId)
    res.status(200).json(vehicles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:companyId/vehicles/:vehicleId', async (req, res, next) => {
  try {
    const vehicle = await vehicleManager.updateVehicle(req.params.vehicleId, req.body)
    res.status(200).json(vehicle)
  } catch (error) {
    const status = error.message === 'Vehicle not found' ? 404 : 400
    res.status(status).json({ error: error.message })
  }
})

router.post('/:companyId/tours', async (req, res, next) => {
  try {
    const newTour = await tourManager.createTour({
      ...req.body,
      company: req.params.companyId,
    })
    res.status(201).json(newTour)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/:companyId/tours', async (req, res, next) => {
  try {
    const tours = await tourManager.getAllToursByCompany(req.params.companyId)
    res.status(200).json(tours)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/:companyId/tours/:tourId', async (req, res, next) => {
  try {
    const newOrder = await tourManager.addOrderToTour(req.params.tourId, req.body.orderId)
    res.status(200).json(newOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:companyId/tours/:tourId', async (req, res, next) => {
  try {
    // Fetch the current tour to check its state
    const currentTour = await tourManager.findTourById(req.params.tourId)
    if (!currentTour) return res.status(404).json({ error: 'Tour not found' })
    if (currentTour.state === 'STARTED' || currentTour.state === 'FINISHED') {
      return res.status(400).json({ error: 'Cannot update a tour that is started or finished' })
    }

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
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
