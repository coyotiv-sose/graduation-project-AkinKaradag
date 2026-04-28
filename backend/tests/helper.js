/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
const request = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')

// Supertest never runs createSocketServer — stub Socket.IO so routes that emit do not throw.
// Real code chains `.to().to().to().emit()` — a self-returning chain supports any depth.
if (!app.io) {
  const chain = {
    to() {
      return chain
    },
    emit() {},
  }
  app.io = { to: () => chain }
}

const clearDatabase = async () => {
  const { collections } = mongoose.connection
  // eslint-disable-next-line guard-for-in
  for (const key in collections) {
    await collections[key].deleteMany()
  }
}

const loginAsAdmin = async (overrides = {}) => {
  const credentials = {
    email: 'admin@example.com',
    password: 'Password1234',
    role: 'admin',
    ...overrides,
  }
  const agent = request.agent(app)
  await agent.post('/accounts').send(credentials)
  await agent.post('/accounts/session').send({
    email: credentials.email,
    password: credentials.password,
  })
  return agent
}

const createCompany = async (agent, overrides = {}) => {
  const response = await agent.post('/admin/companies').send({
    companyName: 'company1',
    address: 'Some Street 1',
    postalCode: '43121',
    city: 'Somewhere',
    ...overrides,
  })
  if (response.body && response.body.company) {
    response.body = response.body.company
  }
  return response
}

const createCustomer = async (agent, companyId, overrides = {}) => {
  const customerResponse = await agent
    .post(`/companies/${companyId}/customers`)
    .send({
      customerName: 'customer1',
      email: 'customer1@mail.com',
      password: 'Password1234',
      billingInfo: [
        {
          customerName: 'customer1',
          address: 'Main Street 1',
          postalCode: '1234',
          city: 'Main City',
          VATnr: 'VAT-001',
        },
      ],
      ...overrides,
    })

  return customerResponse
}

const createAccount = async (overrides = {}) => {
  const accountData = {
    email: 'test@example.com',
    password: 'Password1234',
    role: 'admin',
    ...overrides,
  }
  const accountResponse = await request(app).post('/accounts').send(accountData)
  return accountResponse
}

const sanitizeBillingSnippet = snippet => {
  if (!snippet || typeof snippet !== 'object') return snippet
  const { _id, ...rest } = snippet
  return rest
}

const createOrder = async (agent, customerId, billingSnippet) => {
  const billingInfo = sanitizeBillingSnippet(billingSnippet)
  const orderResponse = await agent
    .post(`/customers/${customerId}/orders`)
    .send({
      origin: 'Zurich',
      destination: 'Basel',
      deliveryDate: '2026-05-16T00:00:00.000Z',
      billingInfo,
      cargos: [
        {
          loadCarrierType: 'Palette',
          dimensions: { width: 1.2, length: 0.8, height: 1.5 },
          weight: 500,
          quantity: 2,
        },
      ],
    })
  return orderResponse
}

module.exports = {
  loginAsAdmin,
  createCompany,
  createCustomer,
  createAccount,
  sanitizeBillingSnippet,
  createOrder,
  clearDatabase,
  app,
  request,
  mongoose,
}
