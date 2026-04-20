/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const Company = require('../models/logistic-company')

const createCompany = async companyData => {
  const company = await Company.create(companyData)
  return company
}

const getCompanyById = async companyId => {
  const company = await Company.findById(companyId)
  if (!company) throw new Error('Company not found')
  return company
}

const getAllCompanies = () => Company.find()

const updateCompany = async (companyId, updates) => {
  const company = await Company.findById(companyId)
  if (!company) throw new Error('Company not found')
  Object.assign(company, updates)
  await company.save()
  return company
}

const deleteCompany = async companyId => {
  const company = await Company.findById(companyId)
  if (!company) throw new Error('Company not found')
  await Company.findByIdAndDelete(companyId)
}

module.exports = {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany,
}
