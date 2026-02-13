const Account = require('./account')
const Customer = require('./customer')

async function createCustomer(customerData) {
    const exist = await Account.findOne({ email: customerData.email })
    if (exist) {
        throw new Error('Email already registered')
    }

    const account = await Account.create({
        email: customerData.email,
        password: customerData.password,
        role: 'customer',
    })

    const customer = await Customer.create({
        account: account._id,
        customerName: customerData.customerName,
        company: customerData.company,
        billingInfo: customerData.billingInfo,
    })

    return customer
}

async function getCustomerById(customerId) {
    const customer = await Customer.findById(customerId)
    if (!customer) throw new Error('Customer not found')
    return customer
}

async function getCustomerByCompany(companyId) {
    return Customer.find({ company: companyId })
}

async function getAllCustomers() {
    return Customer.find()
}

module.exports = { createCustomer, getCustomerById, getCustomerByCompany, getAllCustomers }