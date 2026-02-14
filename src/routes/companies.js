var express = require('express')
var router = express.Router()
var LogisticCompany = require('../logistic-company')
var customerManager = require('../managers/customer-manager')

router.get('/', function(req, res, next) {
    res.render('companies', { companies: LogisticCompany.list })
})

router.post('/', function(req, res, next) {
    const company = LogisticCompany.create(req.body)
    res.send(company)
})

router.post('/:companyId/customers', async(req, res, next) => {
    try {
        const customer = await customerManager.createCustomer({
            ...req.body,
            company: req.params.companyId,
        })
        res.status(201).json(customer)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/:companyId/customers/:customerId', async(req, res, next) => {
    try {
        const customer = await customerManager.getCustomerById(req.params.customerId)
        res.status(200).json(customer)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
})

router.get('/:companyId/customers', async(req, res, next) => {
    try {
        const customers = await customerManager.getCustomerByCompany(req.params.companyId)
        res.status(200).json(customers)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/:companyId/vehicles', function(req, res, next) {
    const company = LogisticCompany.findById(Number(req.params.companyId))

    if (!company) {
        return res.status(404).send('Company not found')
    }

    const newVehicle = company.addVehicle(req.body)
    res.send(newVehicle)
})

router.get('/:companyId/vehicles', function(req, res, next) {
    const company = LogisticCompany.findById(Number(req.params.companyId))

    if (!company) {
        return res.status(404).send('Company not found')
    }

    const vehicleOfCompany = company.getVehicles()

    res.render('company-cars', { vehicles: vehicleOfCompany })
})

module.exports = router