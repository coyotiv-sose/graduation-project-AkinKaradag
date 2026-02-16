const express = require('express')
const router = express.Router()
const customerManager = require('../managers/customer-manager')
const orderManager = require('../managers/order-manager')

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

        const newOrder = await orderManager.createOrder({
            ...req.body,
            customer: customer._id,
            company: customer.company,
        })
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

router.delete('/:customerId/orders/:orderId', async(req, res, next) => {
    try{
        const order = await orderManager.deleteOrderByCustomer(req.params.orderId)
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router