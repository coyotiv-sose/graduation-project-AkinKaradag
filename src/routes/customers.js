var express = require('express')
var router = express.Router()
var Customer = require('../customer')
var orderManager = require('../order-manager')

/* GET account list */
router.get('/', function(req, res, next) {
    res.render('customers', { customers: Customer.list })
})

router.post('/:customerId/orders', function(req, res, next) {
    try {
        const customer = Customer.list.find(c => c.id === Number(req.params.customerId))

        if (!customer) {
            return res.status(404).send('Customer not found')
        }

        const order = customer.placeOrder(req.body)
        res.send(order)
    } catch (error) {
        console.error('Error: ', error.message)
        console.error('Stack:', error.stack)
        res.status(500).send(error.message)
    }
})

router.get('/:customerId/orders', function(req, res, next) {
    const customer = Customer.list.find(c => c.id === Number(req.params.customerId))

    if (!customer) {
        return res.status(404).send('Customer not found')
    }

    const customerOrders = orderManager.getOrders().filter(orders => orders.customerId === customer.id)

    res.render('customer-orders', { orders: customerOrders })
})

module.exports = router