const express = require('express')

const router = express.Router()
const LogisticCompany = require('../models/logistic-company')
const Customer = require('../models/customer')
const Order = require('../models/order')
const Employee = require('../models/employee')
const Account = require('../models/account')
const employeeManager = require('../managers/employee-manager')
const requireRole = require('../middlewares/require-role')

router.use(requireRole('admin'))

// ---- Companies ----

router.get('/companies', async (req, res, next) => {
  try {
    const companies = await LogisticCompany.find()
    res.status(200).json(companies)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/companies', async (req, res, next) => {
  try {
    const { ownerName, ownerEmail, ownerPassword, ...companyData } = req.body
    const company = await LogisticCompany.create(companyData)

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
        await LogisticCompany.findByIdAndDelete(company._id)
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
    const company = await LogisticCompany.findByIdAndUpdate(
      req.params.companyId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!company) return res.status(404).json({ error: 'Company not found' })
    res.status(200).json(company)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/companies/:companyId', async (req, res, next) => {
  try {
    const company = await LogisticCompany.findByIdAndDelete(req.params.companyId)
    if (!company) return res.status(404).json({ error: 'Company not found' })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Customers ----

router.get('/customers', async (req, res, next) => {
  try {
    const customers = await Customer.find().populate('company', 'companyName')
    res.status(200).json(customers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/customers/:customerId', async (req, res, next) => {
  try {
    const { customerName, company, billingInfo, profile, email } = req.body
    const customer = await Customer.findById(req.params.customerId)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })

    if (customerName !== undefined) customer.customerName = customerName
    if (company !== undefined) customer.company = company || null
    if (billingInfo !== undefined) customer.billingInfo = billingInfo
    if (profile !== undefined) customer.profile = profile
    await customer.save()

    if (email !== undefined) {
      const account = await Account.findById(customer.account._id || customer.account)
      if (account) {
        account.email = email
        await account.save()
      }
    }

    const populated = await Customer.findById(customer._id).populate('company', 'companyName')
    res.status(200).json(populated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/customers/:customerId', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.customerId)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    await Account.findByIdAndDelete(customer.account._id || customer.account)
    await Customer.findByIdAndDelete(req.params.customerId)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Orders ----

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'customerName')
      .populate('company', 'companyName')
    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/orders/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('customer', 'customerName').populate('company', 'companyName')
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/orders/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ---- Employees / Password Reset ----

router.get('/employees', async (req, res, next) => {
  try {
    const employees = await Employee.find()
      .populate('account', 'email')
      .populate('company', 'companyName')
    res.status(200).json(employees)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/employees/:employeeId', async (req, res, next) => {
  try {
    const { name, profile, email, company } = req.body
    const employee = await Employee.findById(req.params.employeeId)
    if (!employee) return res.status(404).json({ error: 'Employee not found' })

    if (name !== undefined) employee.name = name
    if (profile !== undefined) employee.profile = profile
    if (company !== undefined) employee.company = company
    await employee.save()

    if (email !== undefined) {
      const account = await Account.findById(employee.account._id || employee.account)
      if (account) {
        account.email = email
        await account.save()
      }
    }

    const populated = await Employee.findById(employee._id)
      .populate('account', 'email')
      .populate('company', 'companyName')
    res.status(200).json(populated)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/employees/:employeeId', async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.employeeId)
    if (!employee) return res.status(404).json({ error: 'Employee not found' })
    await Account.findByIdAndDelete(employee.account._id || employee.account)
    await Employee.findByIdAndDelete(req.params.employeeId)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/customers/:customerId/reset-password', async (req, res, next) => {
  try {
    const { newPassword } = req.body
    if (!newPassword) return res.status(400).json({ error: 'New password is required' })
    const customer = await Customer.findById(req.params.customerId)
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    const account = await Account.findById(customer.account._id || customer.account)
    if (!account) return res.status(404).json({ error: 'Account not found' })
    await account.setPassword(newPassword)
    await account.save()
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/employees/:employeeId/reset-password', async (req, res, next) => {
  try {
    const { newPassword } = req.body
    if (!newPassword) return res.status(400).json({ error: 'New password is required' })
    const employee = await Employee.findById(req.params.employeeId)
    if (!employee) return res.status(404).json({ error: 'Employee not found' })
    const account = await Account.findById(employee.account._id || employee.account)
    if (!account) return res.status(404).json({ error: 'Account not found' })
    await account.setPassword(newPassword)
    await account.save()
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
