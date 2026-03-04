/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
const request = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')

const clearDatabase = async() => {
    const { collections } = mongoose.connection
        // eslint-disable-next-line guard-for-in
    for (const key in collections) {
        await collections[key].deleteMany()
    }
}

const createCompany = async() => {
    const companyResponse = await request(app).post('/companies').send({
        companyName: 'company1',
        address: 'Some Street 1',
        postalCode: '43121',
        city: 'Somewhere',
    })

    return companyResponse
}

const createCustomer = async companyId => {
    const customerResponse = await request(app)
        .post(`/companies/${companyId}/customers`)
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

    return customerResponse
}

const createOrder = async(customerId, billingInfo) => {
    const orderResponse = await request(app)
        .post(`/customers/${customerId}/orders`)
        .send({
            origin: 'Zurich',
            destination: 'Basel',
            deliveryDate: '2026-05-16T00:00:00.000Z',
            billingInfo,
            cargos: [{
                loadCarrierType: 'Palette',
                dimensions: { width: 1.2, length: 0.8, height: 1.5 },
                weight: 500,
                quantity: 2,
            }, ],
        })
    return orderResponse
}

module.exports = {
    createCompany,
    createCustomer,
    createOrder,
    clearDatabase,
    app,
    request,
    mongoose,
}