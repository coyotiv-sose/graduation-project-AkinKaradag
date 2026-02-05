var express = require('express')
var router = express.Router()
var Customer = require('../customer')

/* GET account list */
router.get('/', function(req, res, next) {
    const customers = [
        { customerName: 'customer1' },
        { customerName: 'customer2' },
        { customerName: 'customer3' },
    ]

    const allCustomer = [...customers, ...Customer.list]

    res.render('customers', {customers: allCustomer})
})

/* Add a new Customer */
router.post('/', function(req, res, next) {
    const customer = Customer.create({ customerName: req.body.customerName })
    res.send(customer.customerName)

})


module.exports = router