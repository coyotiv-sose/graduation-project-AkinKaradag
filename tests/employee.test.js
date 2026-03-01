/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, clearDatabase, app, request, mongoose } = require('./helper')

describe('Employee', () => {
  let company
  let employee

  beforeEach(async () => {
    await clearDatabase()
    company = await createCompany()

    employee = await request(app).post(`/companies/${company.body._id}/employees`).send({
      email: 'employee1@company1.com',
      password: 'hashPassword',
      name: 'Employee1',
    })
  })

  it('should create a new employee', async () => {
    expect(employee.status).toBe(201)
    expect(employee.body).toMatchObject({ name: 'Employee1' })
  })

  it('should find an employee by its ID', async () => {
    const response = await request(app).get(`/employees/${employee.body._id}`)
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({ name: 'Employee1' })
  })

  it('should find all employees from a company', async () => {
    await request(app).post(`/companies/${company.body._id}/employees`).send({
      email: 'employee2@company1.com',
      password: 'hashPassword',
      name: 'Employee2',
    })
    const response = await request(app).get(`/companies/${company.body._id}/employees`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
  })

  it('should not create an employee', async() => {
    const employeeWithoutName = await request(app).post(`/companies/${company.body._id}/employees`).send({
      email: 'employee3@company1.com',
      password: 'hashPassword',
    })
    expect(employeeWithoutName.status).toBe(400)
  })

  it('should return 500 for invalid company id', async() => {
    const response = await request(app).get('/companies/invalid-id/employees')
    expect(response.status).toBe(500)
  })

  it('should not find an employee', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/employees/${fakeId}`)
    expect(response.status).toBe(400)
  })
})
