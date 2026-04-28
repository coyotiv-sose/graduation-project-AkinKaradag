/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, clearDatabase, loginAsAdmin, mongoose } = require('./helper')

describe('Employee', () => {
  let agent
  let company
  let employee

  beforeEach(async () => {
    await clearDatabase()
    agent = await loginAsAdmin()
    company = await createCompany(agent)

    employee = await agent.post(`/companies/${company.body._id}/employees`).send({
      email: 'employee1@company1.com',
      password: 'hashPassword1234',
      name: 'Employee1',
    })
  })

  it('should create a new employee', async () => {
    expect(employee.status).toBe(201)
    expect(employee.body).toMatchObject({ name: 'Employee1' })
  })

  it('should find an employee by its ID', async () => {
    const response = await agent.get(`/employees/${employee.body._id}`)
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'Employee1' })
  })

  it('should find all employees from a company', async () => {
    await agent.post(`/companies/${company.body._id}/employees`).send({
      email: 'employee2@company1.com',
      password: 'hashPassword1234',
      name: 'Employee2',
    })
    const response = await agent.get(`/companies/${company.body._id}/employees`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
  })

  it('should not create an employee', async () => {
    const employeeWithoutName = await agent.post(`/companies/${company.body._id}/employees`).send({
      email: 'employee3@company1.com',
      password: 'hashPassword1234',
    })
    expect(employeeWithoutName.status).toBe(400)
  })

  it('should return 400 for invalid company id', async () => {
    const response = await agent.get('/companies/invalid-id/employees')
    expect(response.status).toBe(400)
  })

  it('should not find an employee', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.get(`/employees/${fakeId}`)
    expect(response.status).toBe(404)
  })
})
