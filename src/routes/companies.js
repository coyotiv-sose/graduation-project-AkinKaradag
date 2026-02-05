var express = require('express')
var router = express.Router()
var LogisticCompany = require('../logisticCompany')


router.get('/', function(req, res, next) {
    const companies = [
        {companyName: 'company1'},
        {companyName: 'company2'},
        {companyName: 'company3'}
    ]

    const allCompaniesForAdmins = [...companies, ...LogisticCompany.list]

    res.render('companies', {companies: allCompaniesForAdmins})
})

router.post('/', function(req, res, next){
    const company = LogisticCompany.create({ companyName: req.body.companyName })
    res.send(company.companyName)
})

module.exports = router