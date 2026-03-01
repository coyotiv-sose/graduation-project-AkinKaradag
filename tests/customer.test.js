/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, createCustomer, clearDatabase, app, request, mongoose} = require('./helper')

describe('Customer', () => {
  let company
  let customer

  beforeEach(async () => {
    await clearDatabase()
    company = await createCompany()
    customer = await createCustomer(company.body._id)
    })

  it('should create a customer by a company', async () => {
    const expectedOutput = {
      customerName: 'customer1',
      billingInfo: [
        {
          customerName: 'customer1',
          address: 'Main Street 1',
          postalCode: '1234',
          city: 'Main City',
          VATnr: 'VAT-001',
        },
      ],
    }

    expect(customer.body).toMatchObject(expectedOutput)
  })

  it('should find a customer by its id', async () => {
    const response = await request(app).get(`/customers/${customer.body._id}`)
    expect(response.status).toBe(200)
    expect(response.body.customerName).toBe('customer1')
  })

  it('should not find a customer by its id, if customer does not exist', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/customers/${fakeId}`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Customer not found')
  })

  it('should find all customers belonging to a company', async() => {
    const response = await request(app).get(`/companies/${company.body._id}/customers`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should return empty List for company with no customers', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/companies/${fakeId}/customers`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it(`should return 500 for invalid comapny id`, async() => {
    const response = await request(app).get('/companies/notValidId/customers')
    expect(response.status).toBe(500)

  })

})
