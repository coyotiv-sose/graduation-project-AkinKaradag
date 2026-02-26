/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const request = require('supertest')
const mongoose = require('mongoose')

const app = require('../src/app')

describe('Karalog', () => {
  let company
  let customer
  let customerResponse
  let order
  let orderResponse

  beforeEach(async () => {
    const {collections} = mongoose.connection
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

    customerResponse = await request(app)
      .post(`/companies/${company._id}/customers`)
      .send({
        customerName: 'customer1',
        email: 'customer1@mail.com',
        password: 'shouldNotBeHere',
        billingInfo: [
          {
            customerName: 'customer1',
            address: 'Main Street 1',
            postalCode: '1234',
            city: 'Main City',
            VATnr: 'VAT-001',
          },
        ],
      })

    customer = customerResponse.body

    orderResponse = await request(app)
      .post(`/customers/${customer._id}/orders`)
      .send({
        origin: 'Zurich',
        destination: 'Basel',
        deliveryDate: '2026-05-16T00:00:00.000Z',
        company: company._id,
        billingInfo: customer.billingInfo[0],
        cargos: [
          {
            loadCarrierType: 'Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 500,
            quantity: 2,
          },
        ],
      })

    order = orderResponse.body
  })
  it('can be create a company', async () => {
    expect(company).toMatchObject({ companyName: 'company1' })
  })

  it('should be create a vehicle', async () => {
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

  it('should be create a customer from a company', async () => {
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

    expect(customerResponse.status).toBe(201)
    expect(customer).toMatchObject(expectedOutput)
  })

  it('should create an order from customer side', async () => {
    expect(orderResponse.status).toBe(201)
    expect(order).toMatchObject({
      origin: 'Zurich',
      destination: 'Basel',
    })
  })

  it('should update an order', async () => {
    const orderId = order._id

    const updatedData = {
      origin: 'Lugano',
    }

    const response = await request(app).put(`/orders/${orderId}`).send(updatedData)

    expect(response.status).toBe(200)
    expect(response.body.origin).toBe('Lugano')
    expect(response.body.destination).toBe('Basel')
  })

  it('should not update a non-existing order', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    
    const updatedData = {
        origin: 'Bern'
    }

    const response = await request(app).put(`/orders/${fakeId}`).send(updatedData)

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })

  it('should not update a non-pending order', async() => {
    await mongoose.model('Order').findByIdAndUpdate(order._id, { state: 'IN_PROGRESS'} )

    const updatedData = {
        origin: 'Lugano'
    }

    const response = await request(app).put(`/orders/${order._id}`).send(updatedData)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Order status is not pending')
  })

  it('should be find order by id', async () => {
    const response = await request(app).get(`/orders/${order._id}`)
    expect(response.status).toBe(200)
    expect(response.body.origin).toBe('Zurich')
  })

  it('should not be founded by id', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/orders/${fakeId}`)
    expect(response.body.error).toBe('Order not found')
  })

  it('should be get orders by customer', async () => {
    const response = await request(app).get(`/customers/${customer._id}/orders`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should not create an order without cargos', async () => {
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

  it('should delete order by customer', async () => {
    const response = await request(app).delete(`/customers/${customer._id}/orders/${order._id}`)
    expect(response.status).toBe(204)
  })

  it('should not be deleted by an other customer', async () => {
    const otherCustomer = await request(app).post(`/companies/${company._id}/customers`).send({
        customerName: 'customer2',
        email: 'customer2@mail.co.uk',
        password: 'someStringOrHash',
        billingInfo: [
            {
                customerName: 'customer2',
                address: 'Hauptstrasse 2',
                postalCode: '5555',
                city: 'Nowhere',
                VATnr: 'VAT-007'
            }
        ]
    })


    const otherCustomerId = otherCustomer.body._id

    const response = await request(app).delete(`/customers/${otherCustomerId}/orders/${order._id}`)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Not authorized to delete this order')

  })

  it('should not delete a non-pending order', async() => {
    await mongoose.model('Order').findByIdAndUpdate(order._id, { state: 'IN_PROGRESS'} )

    const response = await request(app).delete(`/customers/${customer._id}/orders/${order._id}`)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Order status is not pending')
  })

  it('should not be found when try to delete order by a customer', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).delete(`/customers/${customer._id}/orders/${fakeId}`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })

    it('should be deleted by a company', async() => {
    const response = await request(app).delete(`/companies/${company._id}/orders/${order._id}`)
    expect(response.status).toBe(204)
  })

  it('should not be deleted by an other company', async() => {
    const otherCompany = await request(app).post('/companies').send({
        companyName: 'company2',
        address: 'Where is this Street 1',
        postalCode: '9999',
        city: 'CouldBeEverywhere'
    })

    const otherCompanyId = otherCompany.body._id

    const response = await request(app).delete(`/companies/${otherCompanyId}/orders/${order._id}`)
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Not authorized to delete this order')
  })

  it('should not delete a delivered order', async() => {
    await mongoose.model('Order').findByIdAndUpdate(order._id, { state: 'DELIVERED'} )
    
    const response = await request(app).delete(`/companies/${company._id}/orders/${order._id}`)
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Delivered orders cannot be deleted')
  })

  it('should not be found when try to delete order by a company', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).delete(`/companies/${company._id}/orders/${fakeId}`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })


})
