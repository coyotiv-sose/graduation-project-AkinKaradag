/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const {
  app,
  request,
  createCompany,
  createCustomer,
  createOrder,
  clearDatabase,
  loginAsAdmin,
  createCustomerProfile,
  sanitizeBillingSnippet,
} = require('./helper')

const createFixture = async () => {
  const agent = await loginAsAdmin()
  const companyResponse = await createCompany(agent)
  const customerResponse = await createCustomer(agent, companyResponse.body._id)
  const employeeResponse = await agent.post(`/companies/${companyResponse.body._id}/employees`).send({
    email: 'employee1@company1.com',
    password: 'hashPassword1234',
    name: 'Employee1',
  })
  const orderResponse = await createOrder(
    agent,
    customerResponse.body._id,
    sanitizeBillingSnippet(customerResponse.body.billingInfo[0])
  )

  return {
    agent,
    company: companyResponse.body,
    customer: customerResponse.body,
    employee: employeeResponse.body,
    order: orderResponse.body,
  }
}

describe('Admin routes', () => {
  beforeEach(async () => {
    await clearDatabase()
  })

  it('requires an authenticated admin account', async () => {
    const unauthenticated = await request(app).get('/admin/companies')
    expect(unauthenticated.status).toBe(401)

    const customerAgent = request.agent(app)
    await createCustomerProfile({
      email: 'customer-admin-check@example.com',
      password: 'CustomerPass1234',
      customerName: 'Regular User',
    })
    await customerAgent.post('/accounts/session').send({
      email: 'customer-admin-check@example.com',
      password: 'CustomerPass1234',
    })

    const forbidden = await customerAgent.get('/admin/companies')
    expect(forbidden.status).toBe(403)
  })

  it('creates a company with an owner account', async () => {
    const agent = await loginAsAdmin()

    const response = await agent.post('/admin/companies').send({
      companyName: 'Owned Logistics',
      address: 'Owner Street 1',
      postalCode: '8000',
      city: 'Zurich',
      ownerName: 'Olivia Owner',
      ownerEmail: 'owner@example.com',
      ownerPassword: 'SecurePass1234',
    })

    expect(response.status).toBe(201)
    expect(response.body.company).toMatchObject({ companyName: 'Owned Logistics' })
    expect(response.body.owner).toMatchObject({ name: 'Olivia Owner' })
    expect(response.body.owner.company.toString()).toBe(response.body.company._id.toString())

    const ownerLogin = await request(app).post('/accounts/session').send({
      email: 'owner@example.com',
      password: 'SecurePass1234',
    })
    expect(ownerLogin.status).toBe(200)
    expect(ownerLogin.body.role).toBe('employee')
  })

  it('rolls back company creation when owner creation fails', async () => {
    const agent = await loginAsAdmin()

    const response = await agent.post('/admin/companies').send({
      companyName: 'Rollback Logistics',
      address: 'Rollback Street 1',
      postalCode: '9000',
      city: 'Bern',
      ownerName: 'Failed Owner',
      ownerEmail: 'failed-owner@example.com',
      ownerPassword: 'FailedOwner1234',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Password must not contain customer, employee, or company name')

    const companies = await agent.get('/admin/companies')
    expect(companies.body.some(company => company.companyName === 'Rollback Logistics')).toBe(false)
  })

  it('updates and deletes a company', async () => {
    const agent = await loginAsAdmin()
    const company = await createCompany(agent)

    const update = await agent.put(`/admin/companies/${company.body._id}`).send({ city: 'Lausanne' })
    expect(update.status).toBe(200)
    expect(update.body.city).toBe('Lausanne')

    const deletion = await agent.delete(`/admin/companies/${company.body._id}`)
    expect(deletion.status).toBe(204)

    const companies = await agent.get('/admin/companies')
    expect(companies.body.some(savedCompany => savedCompany._id === company.body._id)).toBe(false)
  })

  it('lists and updates customers across companies', async () => {
    const { agent, company, customer } = await createFixture()

    const customers = await agent.get('/admin/customers')
    expect(customers.status).toBe(200)
    expect(customers.body).toHaveLength(1)

    const update = await agent.put(`/admin/customers/${customer._id}`).send({
      company: company._id,
      customerName: 'Updated Customer',
      email: 'updated.customer@mail.com',
    })

    expect(update.status).toBe(200)
    expect(update.body.customerName).toBe('Updated Customer')

    const loginWithUpdatedEmail = await request(app).post('/accounts/session').send({
      email: 'updated.customer@mail.com',
      password: 'Password1234',
    })
    expect(loginWithUpdatedEmail.status).toBe(200)
  })

  it('deletes customers through the admin company scope', async () => {
    const { agent, company, customer } = await createFixture()

    const deletion = await agent.delete(`/admin/customers/${customer._id}`).send({ company: company._id })
    expect(deletion.status).toBe(204)

    const customers = await agent.get('/admin/customers')
    expect(customers.body).toHaveLength(0)

    const loginWithDeletedAccount = await request(app).post('/accounts/session').send({
      email: 'customer1@mail.com',
      password: 'Password1234',
    })
    expect(loginWithDeletedAccount.status).toBe(401)
  })

  it('resets customer passwords through the admin route', async () => {
    const { agent, company, customer } = await createFixture()

    const reset = await agent.post(`/admin/customers/${customer._id}/reset-password`).send({
      company: company._id,
      newPassword: 'FreshPass1234',
    })
    expect(reset.status).toBe(200)

    const oldPassword = await request(app).post('/accounts/session').send({
      email: 'customer1@mail.com',
      password: 'Password1234',
    })
    expect(oldPassword.status).toBe(401)

    const newPassword = await request(app).post('/accounts/session').send({
      email: 'customer1@mail.com',
      password: 'FreshPass1234',
    })
    expect(newPassword.status).toBe(200)
  })

  it('lists, updates, and deletes employees across companies', async () => {
    const { agent, company, employee } = await createFixture()

    const employees = await agent.get('/admin/employees')
    expect(employees.status).toBe(200)
    expect(employees.body).toHaveLength(1)

    const update = await agent.put(`/admin/employees/${employee._id}`).send({
      company: company._id,
      name: 'Updated Dispatcher',
      email: 'updated.dispatcher@mail.com',
    })

    expect(update.status).toBe(200)
    expect(update.body.name).toBe('Updated Dispatcher')

    const loginWithUpdatedEmail = await request(app).post('/accounts/session').send({
      email: 'updated.dispatcher@mail.com',
      password: 'hashPassword1234',
    })
    expect(loginWithUpdatedEmail.status).toBe(200)

    const deletion = await agent.delete(`/admin/employees/${employee._id}`).send({ company: company._id })
    expect(deletion.status).toBe(204)

    const afterDeletion = await agent.get('/admin/employees')
    expect(afterDeletion.body).toHaveLength(0)
  })

  it('resets employee passwords through the admin route', async () => {
    const { agent, company, employee } = await createFixture()

    const reset = await agent.post(`/admin/employees/${employee._id}/reset-password`).send({
      company: company._id,
      newPassword: 'FreshStaff1234',
    })
    expect(reset.status).toBe(200)

    const oldPassword = await request(app).post('/accounts/session').send({
      email: 'employee1@company1.com',
      password: 'hashPassword1234',
    })
    expect(oldPassword.status).toBe(401)

    const newPassword = await request(app).post('/accounts/session').send({
      email: 'employee1@company1.com',
      password: 'FreshStaff1234',
    })
    expect(newPassword.status).toBe(200)
  })

  it('lists, updates, and deletes orders through the admin route', async () => {
    const { agent, company, order } = await createFixture()

    const orders = await agent.get('/admin/orders')
    expect(orders.status).toBe(200)
    expect(orders.body).toHaveLength(1)

    const update = await agent.put(`/admin/orders/${order._id}`).send({ destination: 'Lugano' })
    expect(update.status).toBe(200)
    expect(update.body.destination).toBe('Lugano')

    const deletion = await agent.delete(`/admin/orders/${order._id}`).send({ company: company._id })
    expect(deletion.status).toBe(204)

    const afterDeletion = await agent.get('/admin/orders')
    expect(afterDeletion.body).toHaveLength(0)
  })
})
