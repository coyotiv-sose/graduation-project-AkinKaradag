/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const Company = require('../models/logistic-company')
const { DomainError } = require('../lib/domain-error')

const createCompany = async companyData => {
  const company = await Company.create(companyData)
  return company
}

const getCompanyById = async companyId => {
  const company = await Company.findById(companyId)
  if (!company) throw new DomainError('Company not found', { status: 404 })
  return company
}

const getAllCompanies = () => Company.find()

const updateCompany = async (companyId, updates) => {
  const company = await Company.findById(companyId)
  if (!company) throw new DomainError('Company not found', { status: 404 })
  Object.assign(company, updates)
  await company.save()
  return company
}

const deleteCompany = async companyId => {
  const company = await Company.findById(companyId)
  if (!company) throw new DomainError('Company not found', { status: 404 })
  await Company.findByIdAndDelete(companyId)
}

module.exports = {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany,
}
