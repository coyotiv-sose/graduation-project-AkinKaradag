var express = require('express')
var router = express.Router()
var LogisticCompany = require('../logisticCompany')

router.get('/', function(req, res, next) {
    res.render('companies', { companies: LogisticCompany.list })
})

router.post('/', function(req, res, next) {
    const company = LogisticCompany.create(req.body)
    res.send(company)
})

router.post('/:companyId/customers', function(req, res, next) {
    const company = LogisticCompany.findById(Number(req.params.companyId))

    if (!company) {
        return res.status(404).send('Company not found')
    }

    const newCustomer = company.createCustomer(req.body)
    res.send(newCustomer)
})

router.get('/:companyId/customers', function(req, res, next) {
    const company = LogisticCompany.findById(Number(req.params.companyId))

    if (!company) {
        return res.status(404).send('Company not found')
    }

    res.json(company.getCustomers())
})

module.exports = router