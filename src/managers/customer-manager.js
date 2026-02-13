const Account = require('./account')
const BillingInfo = require('../models/billingInfo')
const Customer = require('./customer')

function createCustomer(customerData) {
    const account = Account.create({
        email: customerData.email,
        password: customerData.password,
    })

    const billingInfo = BillingInfo.create(customerData.billingInfo)

    const customer = new Customer({
        id: Date.now() + 6,
        account,
        billingInfo,
        customerName: customerData.customerName,
        companyId: customerData.companyId,
    })

    return customer
}

module.exports = { createCustomer }