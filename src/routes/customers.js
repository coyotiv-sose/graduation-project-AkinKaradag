var express = require('express')
var router = express.Router()
var customerManager = require('../managers/customer-manager')

router.get('/:customerId', async(req, res, next) => {
    try {
        const customer = await customerManager.getCustomerById(req.params.customerId)
        res.json(customer)
    } catch (error) {
        res.status(404).json({ error: error.message })
    }
})

module.exports = router