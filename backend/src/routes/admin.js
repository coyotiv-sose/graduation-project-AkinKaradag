const express = require('express')

const router = express.Router()
const LogisticCompany = require('../models/logistic-company')
const Customer = require('../models/customer')
const Order = require('../models/order')

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

router.get('/customers', async (req, res, next) => {
  try {
    const customers = await Customer.find().populate('company', 'companyName')
    res.status(200).json(customers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

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

module.exports = router
