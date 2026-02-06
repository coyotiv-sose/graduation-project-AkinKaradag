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

/* Add a new Customer */
router.post('/', function(req, res, next) {
    const customer = Customer.create({ customerName: req.body.customerName })

    const company = LogisticCompany.list.find(c => c.companyName === 'company4')

    if (!company) {
        console.log("company1 doesn't exist", LogisticCompany.list)
        return res.status(404).send('company4 not found')
    }

    company.addCustomer(customer)

    console.log(`Customer ${customer.customerName} added to ${company.companyName}`)

    res.send(customer.customerName)
})

module.exports = router