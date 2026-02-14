var express = require('express')
var router = express.Router()
var LogisticCompany = require('../models/logistic-company')
var customerManager = require('../managers/customer-manager')
var employeeManager = require('../managers/employee-manager')
var orderManager = require('../managers/order-manager')
var vehicleManager = require('../managers/vehicle-manager')
var tourManager = require('../managers/tour-manager')


router.post('/', async(req, res, next) => {
    try{
        const company = await LogisticCompany.create(req.body)
        res.status(201).json(company)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/', async(req, res, next) => {
    try{
        const companies = await LogisticCompany.find()
        res.status(200).json(companies)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
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
        res.status(201).json(employee)
    } catch (error) {
        res.status(400).json({ error: error.message })
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

router.post('/:companyId/vehicles', async(req, res, next) => {
    try{
        const newVehicle = await vehicleManager.createVehicle({
            ...req.body,
            company: req.params.companyId
        })
        res.status(201).json(newVehicle)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/:companyId/vehicles', async(req, res, next) => {
    try {
        const vehicles = await vehicleManager.getAllVehiclesOfCompany(req.params.companyId)
        res.status(200).json(vehicles)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/:companyId/tours', async(req, res, next) => {
    try{
        const newTour = await tourManager.createTour({
            ...req.body,
            company: req.params.companyId
        })
        res.status(201).json(newTour)
    } catch(error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/:companyId/tours', async(req, res, next) => {
    try {
        const tours = await tourManager.getAllToursByCompany(req.params.companyId)
        res.status(200).json(tours)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router