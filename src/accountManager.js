const Account = require('./account')
const CustomerProfile = require('./customerProfile')
const EmployeeProfile = require('./employeeProfile')
const BillingInfo = require('./billingInfo')
const Customer = require('./customer')
const Emplyee = require('./employee')


function createCustomer(customerData) {
    const account = Account.create({
        email: customerData.email,
        password: customerData.password
    })

    const customerProfile = new CustomerProfile({
        id: Date.now() + 1,
        accountId: account.id,

    })

    const billingInfo = BillingInfo.create(customerData.billingInfo)

    const customer = new Customer({
        profile: customerProfile,
        account,
        billingInfo,
        customerName: customerData.customerName,
        companyId: customerData.companyId
    })

    return customer

}

module.exports = { createCustomer }