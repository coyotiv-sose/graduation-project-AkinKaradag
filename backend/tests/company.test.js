/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, createCustomer, clearDatabase, loginAsAdmin, request, app, mongoose } = require('./helper')

describe('Company', () => {
  let agent
  let company

  beforeEach(async () => {
    await clearDatabase()
    agent = await loginAsAdmin()
    company = await createCompany(agent)
  })

  it('can be create a company', async () => {
    expect(company.body).toMatchObject({ companyName: 'company1' })
  })

  it('should not create a company', async () => {
    const companyWithMissingFields = await agent.post('/admin/companies').send({
      address: 'Some Street 1',
      postalCode: '43121',
      city: 'Somewhere',
    })
    expect(companyWithMissingFields.status).toBe(400)
  })

  it('should find all companies', async () => {
    await createCompany(agent, {
      companyName: 'company2',
      address: 'Some Street 2',
      postalCode: '43122',
      city: 'Somewhere1',
    })

    const response = await agent.get('/admin/companies')
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
  })

  it('should expose public company list without authentication', async () => {
    await createCompany(agent, {
      companyName: 'Alpha Logistics',
      address: 'Some Street 2',
      postalCode: '43122',
      city: 'Aarau',
    })

    const response = await request(app).get('/companies/public')

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({ companyName: 'Alpha Logistics', city: 'Aarau' })
    expect(response.body[0]).not.toHaveProperty('address')
  })

  it('should find a company by id', async () => {
    const response = await agent.get(`/companies/${company.body._id}`)

    expect(response.status).toBe(200)
    expect(response.body.companyName).toBe('company1')
  })

  it('should return 404 for unknown company detail', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.get(`/companies/${fakeId}`)

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Company not found')
  })

  it('should update a company customer and its account email', async () => {
    const customer = await createCustomer(agent, company.body._id)

    const response = await agent.put(`/companies/${company.body._id}/customers/${customer.body._id}`).send({
      customerName: 'Updated Company Customer',
      email: 'updated-company-customer@example.com',
    })

    expect(response.status).toBe(200)
    expect(response.body.customerName).toBe('Updated Company Customer')

    const login = await request(app).post('/accounts/session').send({
      email: 'updated-company-customer@example.com',
      password: 'Password1234',
    })
    expect(login.status).toBe(200)
  })

  it('should delete a company customer and account', async () => {
    const customer = await createCustomer(agent, company.body._id)

    const response = await agent.delete(`/companies/${company.body._id}/customers/${customer.body._id}`)

    expect(response.status).toBe(204)

    const customers = await agent.get(`/companies/${company.body._id}/customers`)
    expect(customers.body).toHaveLength(0)

    const login = await request(app).post('/accounts/session').send({
      email: 'customer1@mail.com',
      password: 'Password1234',
    })
    expect(login.status).toBe(401)
  })

  it('should reset a company customer password', async () => {
    const customer = await createCustomer(agent, company.body._id)

    const response = await agent.post(`/companies/${company.body._id}/customers/${customer.body._id}/reset-password`).send({
      newPassword: 'CompanyFresh1234',
    })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Password reset successfully' })

    const login = await request(app).post('/accounts/session').send({
      email: 'customer1@mail.com',
      password: 'CompanyFresh1234',
    })
    expect(login.status).toBe(200)
  })

  it('should update and delete a company employee', async () => {
    const employee = await agent.post(`/companies/${company.body._id}/employees`).send({
      email: 'company-employee@example.com',
      password: 'StaffSafe1234',
      name: 'Company Employee',
    })

    const update = await agent.put(`/companies/${company.body._id}/employees/${employee.body._id}`).send({
      name: 'Updated Company Employee',
      email: 'updated-company-employee@example.com',
    })

    expect(update.status).toBe(200)
    expect(update.body.name).toBe('Updated Company Employee')

    const login = await request(app).post('/accounts/session').send({
      email: 'updated-company-employee@example.com',
      password: 'StaffSafe1234',
    })
    expect(login.status).toBe(200)

    const deletion = await agent.delete(`/companies/${company.body._id}/employees/${employee.body._id}`)
    expect(deletion.status).toBe(204)

    const employees = await agent.get(`/companies/${company.body._id}/employees`)
    expect(employees.body).toHaveLength(0)
  })

  it('should reset a company employee password', async () => {
    const employee = await agent.post(`/companies/${company.body._id}/employees`).send({
      email: 'reset-employee@example.com',
      password: 'StaffSafe1234',
      name: 'Reset Employee',
    })

    const response = await agent.post(`/companies/${company.body._id}/employees/${employee.body._id}/reset-password`).send({
      newPassword: 'FreshStaff1234',
    })

    expect(response.status).toBe(200)

    const login = await request(app).post('/accounts/session').send({
      email: 'reset-employee@example.com',
      password: 'FreshStaff1234',
    })
    expect(login.status).toBe(200)
  })
})
