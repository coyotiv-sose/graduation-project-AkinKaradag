const Account = require('../models/account')
const Customer = require('../models/customer')

const createCustomer = async customerData => {
    const exist = await Account.findOne({ email: customerData.email })
    if (exist) throw new Error('Email already registered')

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

const getCustomerById = async customerId => {
    const customer = await Customer.findById(customerId)
    if (!customer) throw new Error('Customer not found')
    return customer
}

const getCustomerByCompany = companyId => Customer.find({ company: companyId })

const getAllCustomers = () => Customer.find()

module.exports = { createCustomer, getCustomerById, getCustomerByCompany, getAllCustomers }