var express = require('express')
var router = express.Router()
var Customer = require('../customer')
const LogisticCompany = require('../logisticCompany')

/* GET account list */
router.get('/', function(req, res, next) {
    const customers = [{ customerName: 'customer1' }, { customerName: 'customer2' }, { customerName: 'customer3' }]

    const allCustomer = [...customers, ...Customer.list]

    res.render('customers', { customers: allCustomer })
})

module.exports = router