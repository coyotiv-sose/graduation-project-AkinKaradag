var express = require('express')
var router = express.Router()
var LogisticCompany = require('../logistic-company')
var customerManager = require('../managers/customer-manager')
var employeeManager = require('../managers/employee-manager')
var orderManager = require('../managers/order-manager')

router.get('/', function(req, res, next) {
    res.render('companies', { companies: LogisticCompany.list })
})

router.post('/', function(req, res, next) {
    const company = LogisticCompany.create(req.body)
    res.send(company)
})

router.post('/:companyId/customers', async(req, res, next) => {
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

router.get('/:companyId/customers/:customerId', async(req, res, next) => {
    try {
        const customer = await customerManager.getCustomerById(req.params.customerId)
        res.status(200).json(customer)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
})

router.get('/:companyId/customers', async(req, res, next) => {
    try {
        const customers = await customerManager.getCustomerByCompany(req.params.companyId)
        res.status(200).json(customers)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/:companyId/employees', async(req, res, next) => {
    try {
        const employee = await employeeManager.createEmployee({
            ...req.body,
            company: req.params.companyId,
        })
        res.status(201).json(customer)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/:companyId/employees/:employeeId', async(req, res, next) => {
    try {
        const employee = await employeeManager.getEmployeeById(req.params.employeeId)
        res.status(200).json(employee)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
})

router.get('/:companyId/employees', async(req, res, next) => {
    try {
        const employees = await employeeManager.getEmployeeByCompany(req.params.companyId)
        res.status(200).json(employees)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/:companyId/orders', async(req, res, next) => {
    try {
        const newOrder = await orderManager.createOrder({
            ...req.body,
            company: req.params.companyId,
        })
        res.status(201).json(newOrder)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/:companyId/orders', async(req, res, next) => {
    try {
        const orders = await orderManager.getOrdersByCompany(req.params.companyId)
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:companyId/customers/:customerId/orders', async(req, res, next) => {
    try {
        const ordersFromCustomer = await orderManager.getOrdersByCustomer(req.params.customerId)
        res.status(200).json(ordersFromCustomer)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:companyId/orders/:orderId', async(req, res, next) => {
    try {
        const oneOrder = await orderManager.findOrderById(req.params.orderId)
        if (!oneOrder) throw new Error('Order not found')
        res.status(200).json(oneOrder)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router