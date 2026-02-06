var express = require('express')
var router = express.Router()
var orderManager = require('../orderManager')

router.get('/', function(req, res, next) {
    res.render('orders', { orders: orderManager.getOrders() })
})

router.post('/', function(req, res, next) {
    const order = orderManager.createOrder(req.body)
    res.send(order)
})

module.exports = router