/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, createCustomer, createOrder, clearDatabase, app, request, mongoose} = require('./helper')


describe('Tour', ()=> {
let company
let customer
let order
let vehicle
let tour


    beforeEach(async() => {
        await clearDatabase()
        company = await createCompany()
        customer = await createCustomer(company.body._id)
        order = await createOrder(customer.body._id, customer.body.billingInfo[0])

        vehicle = await request(app).post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck1',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
            payLoad: 800,
        })

        tour = await request(app).post(`/companies/${company.body._id}/tours`).send({
            date: '2026-03-16T00:00:00.000Z',
            startLocation: 'Basel',
            endLocation: 'Chur',
            orders: [order.body._id],
            state: 'PLANNED'
        })

    })

    it('should create a tour', async() => {
        expect(tour.status).toBe(201)
        expect(tour.body).toMatchObject({ startLocation: 'Basel' })
    })





})