const Account = require('../models/account')
const Customer = require('../models/customer')
const Company = require('../models/logistic-company')
const { ACTOR_PROFILE_NOT_FOUND_ERROR_CODES } = require('../lib/authz-error-codes')
const { validatePasswordPolicy } = require('../lib/password-policy')

const createCustomer = async customerData => {
  const company = customerData.company ? await Company.findById(customerData.company) : null
  validatePasswordPolicy(customerData.password, {
    customerName: customerData.customerName,
    companyName: company?.companyName,
  })

  const exist = await Account.findOne({ email: customerData.email })
  if (exist) throw new Error('Email already registered')

  const account = await Account.register(
    new Account({
      email: customerData.email,
      role: 'customer',
    }),
    customerData.password
  )

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
  if (!customer) {
    const error = new Error('Customer not found')
    error.code = ACTOR_PROFILE_NOT_FOUND_ERROR_CODES.customer
    throw error
  }
  return customer
}

const validateCustomerBelongsToCompany = async (customerId, companyId) => {
  const customer = await Customer.findOne({ _id: customerId, company: companyId })
  if (!customer) throw new Error('Customer not found')
  return customer
}

const updateCustomerByCompany = async (customerId, companyId, updates) => {
  const { customerName, billingInfo, profile, email } = updates
  const customer = await Customer.findOne({ _id: customerId, company: companyId })
  if (!customer) throw new Error('Customer not found in this company')

  if (customerName !== undefined) customer.customerName = customerName
  if (billingInfo !== undefined) customer.billingInfo = billingInfo
  if (profile !== undefined) customer.profile = profile
  await customer.save()

  if (email !== undefined) {
    const account = await Account.findById(customer.account._id || customer.account)
    if (account) {
      account.email = email
      await account.save()
    }
  }

  return Customer.findById(customer._id).populate('company', 'companyName')
}

const deleteCustomerByCompany = async (customerId, companyId) => {
  const customer = await Customer.findOne({ _id: customerId, company: companyId })
  if (!customer) throw new Error('Customer not found in this company')
  await Account.findByIdAndDelete(customer.account._id || customer.account)
  await Customer.findByIdAndDelete(customerId)
}

const resetCustomerPasswordByCompany = async (customerId, companyId, newPassword) => {
  if (!newPassword) throw new Error('New password is required')
  const customer = await Customer.findOne({ _id: customerId, company: companyId })
  if (!customer) throw new Error('Customer not found in this company')
  const company = await Company.findById(companyId)
  validatePasswordPolicy(newPassword, {
    customerName: customer.customerName,
    companyName: company?.companyName,
  })
  const account = await Account.findById(customer.account._id || customer.account)
  if (!account) throw new Error('Account not found')
  await account.setPassword(newPassword)
  await account.save()
}

module.exports = {
  createCustomer,
  getCustomerById,
  getCustomerByAccountId,
  getCustomerByCompany,
  getAllCustomers,
  validateCustomerBelongsToCompany,
  updateCustomerByCompany,
  deleteCustomerByCompany,
  resetCustomerPasswordByCompany,
}
