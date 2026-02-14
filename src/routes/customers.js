var express = require('express')
var router = express.Router()
var customerManager = require('../managers/customer-manager')
var orderManager = require('../managers/order-manager')

router.get('/:customerId', async(req, res, next) => {
    try {
        const customer = await customerManager.getCustomerById(req.params.customerId)
        res.json(customer)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
})

router.post('/:customerId/orders', async(req, res, next) => {
    try {
        const customer = await customerManager.getCustomerById(req.params.customerId)

        const newOrder = await customer.placeOrder(req.body)
        res.status(201).json(newOrder)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/:customerId/orders', async(req, res, next) => {
    try {
        const orders = await orderManager.getOrdersByCustomer(req.params.customerId)
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:customerId/orders/:orderId', async(req, res, next) => {
    try {
        const order = await orderManager.findOrderById(req.params.orderId)
        res.status(200).json(order)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router