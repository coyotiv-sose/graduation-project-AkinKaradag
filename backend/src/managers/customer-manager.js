const Account = require('../models/account')
const Customer = require('../models/customer')

const createCustomer = async customerData => {
  const exist = await Account.findOne({ email: customerData.email })
  if (exist) throw new Error('Email already registered')

  const account = await Account.register(new Account({
    email: customerData.email,
    role: 'customer',
  }), customerData.password)

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

const getCustomerByAccountId = async accountId => {
  const customer = await Customer.findOne({ account: accountId })
  if (!customer) throw new Error('Customer not found')
  return customer
}

const validateCustomerBelongsToCompany = async (customerId, companyId) => {
  const customer = await Customer.findOne({ _id: customerId, company: companyId })
  if (!customer) throw new Error('Customer not found')
  if (!customer) throw new Error('Customer does not belong to this company')
}

module.exports = {
  createCustomer,
  getCustomerById,
  getCustomerByAccountId,
  getCustomerByCompany,
  getAllCustomers,
  validateCustomerBelongsToCompany,
}
