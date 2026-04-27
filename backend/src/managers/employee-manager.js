const Account = require('../models/account')
const Employee = require('../models/employee')
const Company = require('../models/logistic-company')
const { validatePasswordPolicy } = require('../lib/password-policy')

const createEmployee = async employeeData => {
  const company = employeeData.company ? await Company.findById(employeeData.company) : null
  validatePasswordPolicy(employeeData.password, {
    employeeName: employeeData.name,
    companyName: company?.companyName,
  })

  const exist = await Account.findOne({ email: employeeData.email })
  if (exist) throw new Error('Email already registered')

  const account = await Account.register(
    new Account({
      email: employeeData.email,
      role: 'employee',
    }),
    employeeData.password
  )

  const employee = await Employee.create({
    account: account._id,
    name: employeeData.name,
    company: employeeData.company,
    profile: 'DISPATCHER',
  })

  return employee
}

const getEmployeeById = async employeeId => {
  const employee = await Employee.findById(employeeId)
  if (!employee) throw new Error('Employee not found')
  return employee
}

const getEmployeeByCompany = companyId => Employee.find({ company: companyId })

const getAllEmployees = () => Employee.find()

const getEmployeeByAccountId = async accountId => {
  const employee = await Employee.findOne({ account: accountId })
  if (!employee) throw new Error('Employee not found')
  return employee
}

const updateEmployeeByCompany = async (employeeId, companyId, updates) => {
  const { name, profile, email } = updates
  const employee = await Employee.findOne({ _id: employeeId, company: companyId })
  if (!employee) throw new Error('Employee not found in this company')

  if (name !== undefined) employee.name = name
  if (profile !== undefined) employee.profile = profile
  await employee.save()

  if (email !== undefined) {
    const account = await Account.findById(employee.account._id || employee.account)
    if (account) {
      account.email = email
      await account.save()
    }
  }

  return Employee.findById(employee._id).populate('account', 'email').populate('company', 'companyName')
}

const deleteEmployeeByCompany = async (employeeId, companyId) => {
  const employee = await Employee.findOne({ _id: employeeId, company: companyId })
  if (!employee) throw new Error('Employee not found in this company')
  await Account.findByIdAndDelete(employee.account._id || employee.account)
  await Employee.findByIdAndDelete(employeeId)
}

const resetEmployeePasswordByCompany = async (employeeId, companyId, newPassword) => {
  if (!newPassword) throw new Error('New password is required')
  const employee = await Employee.findOne({ _id: employeeId, company: companyId })
  if (!employee) throw new Error('Employee not found in this company')
  const company = await Company.findById(companyId)
  validatePasswordPolicy(newPassword, {
    employeeName: employee.name,
    companyName: company?.companyName,
  })
  const account = await Account.findById(employee.account._id || employee.account)
  if (!account) throw new Error('Account not found')
  await account.setPassword(newPassword)
  await account.save()
}

module.exports = {
  createEmployee,
  getEmployeeByCompany,
  getEmployeeById,
  getEmployeeByAccountId,
  getAllEmployees,
  updateEmployeeByCompany,
  deleteEmployeeByCompany,
  resetEmployeePasswordByCompany,
}
