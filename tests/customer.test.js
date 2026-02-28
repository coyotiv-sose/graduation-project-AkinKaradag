/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const request = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')

describe('Customer', () => {
    let company
    let customer

    beforeEach(async() => {
        const { collections } = mongoose.connection
        // eslint-disable-next-line guard-for-in
        for(const key in collections) {
            await collections[key].deleteMany()
        }

        const response = await request(app).post('/companies').send({
            companyName: 'company1',
            address: 'Some Street 1',
            postalCode: '43121',
            city: 'Somewhere',
        })
        company = response.body

                customerResponse = await request(app)
            .post(`/companies/${company._id}/customers`)
            .send({
                customerName: 'customer1',
                email: 'customer1@mail.com',
                password: 'shouldNotBeHere',
                billingInfo: [{
                    customerName: 'customer1',
                    address: 'Main Street 1',
                    postalCode: '1234',
                    city: 'Main City',
                    VATnr: 'VAT-001',
                }, ],
            })

        customer = customerResponse.body
    })

    

    it('should create a customer by a company', async() => {
                const expectedOutput = {
            customerName: 'customer1',
            billingInfo: [{
                customerName: 'customer1',
                address: 'Main Street 1',
                postalCode: '1234',
                city: 'Main City',
                VATnr: 'VAT-001',
            }, ],
        }

        expect(customerResponse.status).toBe(201)
        expect(customer).toMatchObject(expectedOutput)
    })

    it('should find a customer by its id', async() => {
        const response = await request(app).get(`/customers/${customer._id}`)
        expect(response.status).toBe(200)
        expect(response.body.customerName).toBe('customer1')
    })

})