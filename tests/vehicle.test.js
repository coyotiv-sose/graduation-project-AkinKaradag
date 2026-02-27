/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const request = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')

describe('Vehicle', () => {
    let company

    beforeEach(async() => {
        const { collections } = mongoose.connection
            // eslint-disable-next-line guard-for-in
        for (const key in collections) {
            await collections[key].deleteMany()
        }

        const response = await request(app).post('/companies').send({
            companyName: 'company1',
            address: 'Some Street 1',
            postalCode: '43121',
            city: 'Somewhere',
        })
        company = response.body
    })

    it('should create a vehicle', async() => {
        const vehicleData = {
            name: 'Truck1',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
            payLoad: 800,
        }

        const response = await request(app).post(`/companies/${company._id}/vehicles`).send(vehicleData)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(vehicleData)
    })

    it('should find a vehicle by Id', async() => {
        const vehicle = await request(app).post(`/companies/${company._id}/vehicles`).send({
            name: 'Truck2',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2009,
            payLoad: 1000,
        })

        const response = await request(app).get(`/vehicles/${vehicle.body._id}`)
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('Truck2')
    })

    it('should not find vehicle by id', async() => {
        const fakeId = new mongoose.Types.ObjectId()

        const response = await request(app).get(`/vehicles/${fakeId}`)
        expect(response.status).toBe(500)
        expect(response.body.error).toBe('Vehicle not found')
    })
})