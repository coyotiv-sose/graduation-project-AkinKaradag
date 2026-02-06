var express = require('express')
var router = express.Router()
var LogisticCompany = require('../logisticCompany')

router.get('/', function(req, res, next) {
    const companies = [{ companyName: 'company1' }, { companyName: 'company2' }, { companyName: 'company3' }]

    const allCompaniesForAdmins = [...companies, ...LogisticCompany.list]

    res.render('companies', { companies: allCompaniesForAdmins })
})

router.post('/', function(req, res, next) {
    const company = LogisticCompany.create({ companyName: req.body.companyName })
    res.send(company.companyName)
})

router.post('/:companyId/customers', function(req, res, next) {
    const company = LogisticCompany.findById(req.params.companyId)

    if (!company) {
        return res.status(404).send('Company not found')
    }

    const newCustomer = company.createCustomer(req.body)
    res.send(newCustomer)
})

module.exports = router