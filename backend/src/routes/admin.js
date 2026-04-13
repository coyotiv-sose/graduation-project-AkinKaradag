const express = require('express')

const router = express.Router()
const LogisticCompany = require('../models/logistic-company')
const Customer = require('../models/customer')
const Order = require('../models/order')
const Employee = require('../models/employee')
const Account = require('../models/account')

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
    const company = await LogisticCompany.create(req.body)
    res.status(201).json(company)
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
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { $set: { customerName: req.body.customerName } },
      { new: true, runValidators: true }
    ).populate('company', 'companyName')
    if (!customer) return res.status(404).json({ error: 'Customer not found' })
    res.status(200).json(customer)
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
