/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const request = require('supertest')

const app = require('../src/app')
const Company = require('../src/models/logistic-company')
const Vehicle = require('../src/models/vehicle')

describe('Karalog', () => {
    beforeEach(async () => {
        await Company.deleteMany()
        await Vehicle.deleteMany()
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
  it('shoul be create a vehicle', async () => {
    const vehicleData = {
        name: 'Truck1',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2005,
        payLoad: 800,
    }
    const expectedOutput = {
        ...vehicleData,
    }
    const actualOutput = await request(app)
        .post('/vehicles')
        .send(expectedOutput)
    
    expect(actualOutput.body).toMatchObject(expectedOutput.body)
  })
})
