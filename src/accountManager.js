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
        accoundId: account.id,

    })

    const billingInfo = BillingInfo.create(customerData)

    const customer = new Customer({
        profile,
        account,
        billingInfo,
        customerName: customerData.customerName,
        companyId: customerData.companyId
    })

}