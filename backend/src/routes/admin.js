const express = require('express')

const router = express.Router()
const companyManager = require('../managers/company-manager')
const orderManager = require('../managers/order-manager')
const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const requireRole = require('../middlewares/require-role')
const validate = require('./validations/admin-validation')

router.use(requireRole('admin'))

// ---- Companies ----

router.get('/companies', async (req, res, next) => {
  try {
    const companies = await companyManager.getAllCompanies()
    res.status(200).json(companies)
  } catch (error) {
    next(error)
  }
})

router.post('/companies', validate.validateAdminCompanyCreate, async (req, res, next) => {
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
        return next(ownerError)
      }
    }

    return res.status(201).json({ company, owner })
  } catch (error) {
    return next(error)
  }
})

router.put('/companies/:companyId', validate.validateAdminCompanyUpdate, async (req, res, next) => {
  try {
    const company = await companyManager.updateCompany(req.params.companyId, req.body)
    res.status(200).json(company)
  } catch (error) {
    next(error)
  }
})

router.delete('/companies/:companyId', validate.validateCompanyIdParam, async (req, res, next) => {
  try {
    await companyManager.deleteCompany(req.params.companyId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// ---- Customers ----

router.get('/customers', async (req, res, next) => {
  try {
    const customers = await customerManager.getAllCustomers()
    res.status(200).json(customers)
  } catch (error) {
    next(error)
  }
})

router.put('/customers/:customerId', validate.validateAdminCustomerUpdate, async (req, res, next) => {
  try {
    const { company } = req.body
    const updated = await customerManager.updateCustomerByCompany(req.params.customerId, company, req.body)
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
})

router.delete('/customers/:customerId', validate.validateAdminCustomerDelete, async (req, res, next) => {
  try {
    const { company } = req.body
    await customerManager.deleteCustomerByCompany(req.params.customerId, company)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// ---- Orders ----

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await orderManager.getOrders()
    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
})

router.put('/orders/:orderId', validate.validateAdminOrderUpdate, async (req, res, next) => {
  try {
    const updated = await orderManager.updateOrder(req.params.orderId, req.body)
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
})

router.delete('/orders/:orderId', validate.validateAdminOrderDelete, async (req, res, next) => {
  try {
    await orderManager.deleteOrderByCompany(req.params.orderId, req.body.company)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// ---- Employees / Password Reset ----

router.get('/employees', async (req, res, next) => {
  try {
    const employees = await employeeManager.getAllEmployees()
    res.status(200).json(employees)
  } catch (error) {
    next(error)
  }
})

router.put('/employees/:employeeId', validate.validateAdminEmployeeUpdate, async (req, res, next) => {
  try {
    const { company } = req.body
    const updated = await employeeManager.updateEmployeeByCompany(req.params.employeeId, company, req.body)
    res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
})

router.delete('/employees/:employeeId', validate.validateAdminEmployeeDelete, async (req, res, next) => {
  try {
    const { company } = req.body
    await employeeManager.deleteEmployeeByCompany(req.params.employeeId, company)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.post('/customers/:customerId/reset-password', validate.validateAdminCustomerPasswordReset, async (req, res, next) => {
  try {
    const { newPassword, company } = req.body
    await customerManager.resetCustomerPasswordByCompany(req.params.customerId, company, newPassword)
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    next(error)
  }
})

router.post('/employees/:employeeId/reset-password', validate.validateAdminEmployeePasswordReset, async (req, res, next) => {
  try {
    const { newPassword, company } = req.body
    await employeeManager.resetEmployeePasswordByCompany(req.params.employeeId, company, newPassword)
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    next(error)
  }
})

module.exports = router
