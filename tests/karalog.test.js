/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const request = require('supertest')

const app = require('../src/app')
const Company = require('../src/models/logistic-company')

describe('Karalog', () => {
    beforeEach(async () => {
        await Company.deleteMany()
    })
  it('can be create a company', async () => {
    const companyData = {
      companyName: 'company1',
      address: 'Some Street 1',
      postalCode: '43121',
      city: 'Somewhere',
    }
    const expectedOutput = {
      ...companyData,
    }
    const actualOutput = await request(app)
        .post('/companies')
        .send(expectedOutput)

    expect(actualOutput.body).toMatchObject(expectedOutput.body)
  })
})
