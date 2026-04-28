/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, clearDatabase, loginAsAdmin } = require('./helper')

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
})
