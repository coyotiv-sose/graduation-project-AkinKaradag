/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
const express = require('express')

const router = express.Router()
const companyManager = require('../managers/company-manager')
const orderManager = require('../managers/order-manager')
const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const requireRole = require('../middlewares/require-role')

router.use(requireRole('admin'))

// ---- Companies ----

router.get('/companies', async (req, res, next) => {
  try {
    const companies = await companyManager.getAllCompanies()
    res.status(200).json(companies)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/companies', async (req, res, next) => {
  try {
    const { ownerName, ownerEmail, ownerPassword, ...companyData } = req.body
    const company = await companyManager.createCompany(companyData)

    let owner = null
    if (ownerName && ownerEmail && ownerPassword) {
      try {
        owner = await employeeManager.createEmployee({
          name: ownerName,
          email: ownerEmail,
          password: ownerPassword,
          company: company._id,
        })
      } catch (ownerError) {
        await companyManager.deleteCompany(company._id)
        return res.status(400).json({ error: ownerError.message })
      }
    }

    res.status(201).json({ company, owner })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/companies/:companyId', async (req, res, next) => {
  try {
    const company = await companyManager.updateCompany(req.params.companyId, req.body)
    if (!company) return res.status(404).json({ error: 'Company not found' })
    res.status(200).json(company)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/companies/:companyId', async (req, res, next) => {
  try {
    await companyManager.deleteCompany(req.params.companyId)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Customers ----

router.get('/customers', async (req, res, next) => {
  try {
    const customers = await customerManager.getAllCustomers()
    res.status(200).json(customers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/customers/:customerId', async (req, res, next) => {
  try {
    const company = req.body.company
    const updates = req.body
    const updated = await customerManager.updateCustomerByCompany(req.params.customerId, company, updates)
    if (!updated) return res.status(404).json({ error: 'Customer not found' })
    res.status(200).json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/customers/:customerId', async (req, res, next) => {
  try {
    const company = req.body.company
    await customerManager.deleteCustomerByCompany(req.params.customerId, company)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Orders ----

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await orderManager.getOrders()
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/orders/:orderId', async (req, res, next) => {
  try {
    const updated = await orderManager.updateOrder(req.params.orderId, req.body)
    if (!updated) return res.status(404).json({ error: 'Order not found or not pending' })
    res.status(200).json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/orders/:orderId', async (req, res, next) => {
  try {
    // For admin, we assume company context is not required, so just delete by id
    const deleted = await orderManager.deleteOrderByCompany(req.params.orderId, req.body.company)
    if (!deleted) return res.status(404).json({ error: 'Order not found' })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Employees / Password Reset ----

router.get('/employees', async (req, res, next) => {
  try {
    const employees = await employeeManager.getAllEmployees()
    res.status(200).json(employees)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/employees/:employeeId', async (req, res, next) => {
  try {
    const company = req.body.company
    const updates = req.body
    const updated = await employeeManager.updateEmployeeByCompany(req.params.employeeId, company, updates)
    if (!updated) return res.status(404).json({ error: 'Employee not found' })
    res.status(200).json(updated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/employees/:employeeId', async (req, res, next) => {
  try {
    const company = req.body.company
    await employeeManager.deleteEmployeeByCompany(req.params.employeeId, company)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/customers/:customerId/reset-password', async (req, res, next) => {
  try {
    const { newPassword, company } = req.body
    await customerManager.resetCustomerPasswordByCompany(req.params.customerId, company, newPassword)
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/employees/:employeeId/reset-password', async (req, res, next) => {
  try {
    const { newPassword, company } = req.body
    await employeeManager.resetEmployeePasswordByCompany(req.params.employeeId, company, newPassword)
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
