/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const request = require('supertest')

const app = require('../src/app')
const mongoose = require('mongoose')

describe('Karalog', () => {
    let company
    let customer
    let customerResponse
    let order
    let orderResponse

    beforeEach(async() => {
        const collections = mongoose.connection.collections
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

        orderResponse = await request(app)
            .post(`/customers/${customer._id}/orders`)
            .send({
                origin: 'Zurich',
                destination: 'Basel',
                deliveryDate: '2026-05-16T00:00:00.000Z',
                billingInfo: customer.billingInfo[0],
                cargos: [{
                    loadCarrierType: 'Palette',
                    dimensions: { width: 1.2, length: 0.8, height: 1.5 },
                    weight: 500,
                    quantity: 2,
                }, ],
            })

        order = orderResponse.body
    })
    it('can be create a company', async() => {
        expect(company).toMatchObject({ companyName: 'company1' })
    })

    it('should be create a vehicle', async() => {
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

    it('should be create a customer from a company', async() => {
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

    it('should create an order from customer side', async() => {
        expect(orderResponse.status).toBe(201)
        expect(order).toMatchObject({
            origin: 'Zurich',
            destination: 'Basel',
        })
    })

    it('should update an order', async() => {
        const orderId = order._id

        const updatedData = {
            origin: 'Lugano',
        }

        const response = await request(app).put(`/orders/${orderId}`).send(updatedData)

        expect(response.status).toBe(200)
        expect(response.body.origin).toBe('Lugano')
        expect(response.body.destination).toBe('Basel')
    })

    it('should be find order by id', async() => {
        const response = await request(app).get(`/orders/${order._id}`)
        expect(response.status).toBe(200)
        expect(response.body.origin).toBe('Zurich')
    })

    it('should be get orders by customer', async() => {
        const response = await request(app).get(`/customers/${customer._id}/orders`)
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(1)
    })

    it('should not create an order without cargos', async() => {
        const response = await request(app).post(`/customers/${customer._id}/orders`).send({
            origin: 'Bern',
            destination: 'Zurich',
            deliveryDate: '2026-03-16T00:00:00.000Z',
            billingInfo: customer.billingInfo,
            cargos: [],
        })
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('Order must contain at least one cargo')
    })

    it('should delete order by customer', async() => {
        const response = await request(app).delete(`/customers/${customer._id}/orders/${order._id}`)
        expect(response.status).toBe(204)
    })
})