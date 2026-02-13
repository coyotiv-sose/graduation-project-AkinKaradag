var express = require('express')
var router = express.Router()
var customerManager = require('../managers/customer-manager')

router.post('/', async(req, res, next) => {
    try {
        const customer = await customerManager.createCustomer(req.body)
        res.status(201).json(customer)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/', async(req, res, next) => {
    try {
        const customers = await customerManager.getAllCustomers()
        res.json(customers)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:customerId', async(req, res, next) => {
    try {
        const customer = await customerManager.getCustomerById(req.params.customerId)
        res.json(customer)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
})

module.exports = router