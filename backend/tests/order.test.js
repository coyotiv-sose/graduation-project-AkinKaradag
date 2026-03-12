/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, createCustomer, createOrder, clearDatabase, app, request, mongoose } = require('./helper')

describe('Order', () => {
  let company
  let customer
  let order

  beforeEach(async () => {
    await clearDatabase()
    company = await createCompany()
    customer = await createCustomer(company.body._id)
    order = await createOrder(customer.body._id, customer.body.billingInfo[0])
  })

  it('should create an order by a customer', async () => {
    expect(order.status).toBe(201)
    expect(order.body).toMatchObject({
      origin: 'Zurich',
      destination: 'Basel',
    })
  })

  it('should update an order', async () => {
    const orderId = order.body._id

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
      origin: 'Bern',
    }

    const response = await request(app).put(`/orders/${fakeId}`).send(updatedData)

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })

  it('should not update a non-pending order', async () => {
    await mongoose.model('Order').findByIdAndUpdate(order.body._id, { state: 'IN_PROGRESS' })

    const updatedData = {
      origin: 'Lugano',
    }

    const response = await request(app).put(`/orders/${order.body._id}`).send(updatedData)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Order status is not pending')
  })

  it('should find order by id', async () => {
    const response = await request(app).get(`/orders/${order.body._id}`)
    expect(response.status).toBe(200)
    expect(response.body.origin).toBe('Zurich')
  })

  it('should not be found by id', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/orders/${fakeId}`)
    expect(response.body.error).toBe('Order not found')
  })

  it('should get orders by customer', async () => {
    const response = await request(app).get(`/customers/${customer.body._id}/orders`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should not create an order without cargos', async () => {
    const response = await request(app).post(`/customers/${customer.body._id}/orders`).send({
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
    const response = await request(app).delete(`/customers/${customer.body._id}/orders/${order.body._id}`)
    expect(response.status).toBe(204)
  })

  it('should not be deleted by an other customer', async () => {
    const otherCustomer = await request(app)
      .post(`/companies/${company._id}/customers`)
      .send({
        customerName: 'customer2',
        email: 'customer2@mail.co.uk',
        password: 'someStringOrHash',
        billingInfo: [
          {
            customerName: 'customer2',
            address: 'Hauptstrasse 2',
            postalCode: '5555',
            city: 'Nowhere',
            VATnr: 'VAT-007',
          },
        ],
      })

    const otherCustomerId = otherCustomer.body._id

    const response = await request(app).delete(`/customers/${otherCustomerId}/orders/${order.body._id}`)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Not authorized to delete this order')
  })

  it('should not delete a non-pending order', async () => {
    await mongoose.model('Order').findByIdAndUpdate(order.body._id, { state: 'IN_PROGRESS' })

    const response = await request(app).delete(`/customers/${customer.body._id}/orders/${order.body._id}`)

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Order status is not pending')
  })

  it('should not be found when try to delete order by a customer', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).delete(`/customers/${customer.body._id}/orders/${fakeId}`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })

  it('should be deleted by a company', async () => {
    const response = await request(app).delete(`/companies/${company.body._id}/orders/${order.body._id}`)
    expect(response.status).toBe(204)
  })

  it('should not be deleted by an other company', async () => {
    const otherCompany = await request(app).post('/companies').send({
      companyName: 'company2',
      address: 'Where is this Street 1',
      postalCode: '9999',
      city: 'CouldBeEverywhere',
    })

    const otherCompanyId = otherCompany.body._id

    const response = await request(app).delete(`/companies/${otherCompanyId}/orders/${order.body._id}`)
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Not authorized to delete this order')
  })

  it('should not delete a delivered order', async () => {
    await mongoose.model('Order').findByIdAndUpdate(order.body._id, { state: 'DELIVERED' })

    const response = await request(app).delete(`/companies/${company.body._id}/orders/${order.body._id}`)
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Delivered orders cannot be deleted')
  })

  it('should not be found when try to delete order by a company', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).delete(`/companies/${company.body._id}/orders/${fakeId}`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })

  it('should create an order by a company', async () => {
    const response = await request(app)
      .post(`/companies/${company.body._id}/orders`)
      .send({
        origin: 'Bern',
        destination: 'Lugano',
        deliveryDate: '2026-06-01T00:00:00.000Z',
        customer: customer.body._id,
        billingInfo: customer.body.billingInfo[0],
        cargos: [
          {
            loadCarrierType: 'Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 300,
            quantity: 1,
          },
        ],
      })
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ destination: 'Lugano' })
  })

  it('should not create an order without customer', async () => {
    const response = await request(app)
      .post(`/companies/${company.body._id}/orders`)
      .send({
        origin: 'Bern',
        destination: 'Lugano',
        deliveryDate: '2026-06-01T00:00:00.000Z',
        billingInfo: customer.body.billingInfo[0],
        cargos: [
          {
            loadCarrierType: 'Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 300,
            quantity: 1,
          },
        ],
      })
    expect(response.status).toBe(400)
  })

  it('should get order by company', async () => {
    const response = await request(app).get(`/companies/${company.body._id}/orders`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should return 500 for invalid company id', async () => {
    const response = await request(app).get('/companies/invalid-id/orders')
    expect(response.status).toBe(500)
  })

  it('should find Order from customer which belongs to a company', async () => {
    const response = await request(app).get(`/companies/${company.body._id}/customers/${customer.body._id}/orders`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should not find an order from a customer which belong not to a company', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/companies/${fakeId}/customers/${customer.body._id}/orders`)
    expect(response.status).toBe(404)
  })

  it('should not get orders for customer with invalid ID', async () => {
    const response = await request(app).get('/customers/invalid-id/orders')
    expect(response.status).toBe(500)
  })

  it('should find an order belonging to an customer', async () => {
    const response = await request(app).get(`/customers/${customer.body._id}/orders/${order.body._id}`)
    expect(response.status).toBe(200)
  })

  it('should not find an order beloning to an customer with no ID', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/customers/${customer.body._id}/orders/${fakeId}`)
    expect(response.status).toBe(400)
  })

  it('should add cargos to the Order', async () => {
    const response = await request(app)
      .post(`/customers/${customer.body._id}/orders/${order.body._id}/cargos`)
      .send({
        loadCarrierType: 'Industiral Palett',
        dimensions: { width: 152, length: 1.0, height: 1.5 },
        weight: 700,
        quantity: 2,
      })
    expect(response.status).toBe(201)
    expect(response.body.cargos).toHaveLength(2)
  })

  it('should not add a cargo to a Order', async () => {
    const response = await request(app).post(`/customers/${customer.body._id}/orders/${order.body._id}/cargos`).send({
      loadCarrierType: 'Industiral Palett',
      weight: 700,
      quantity: 2,
    })
    expect(response.status).toBe(400)
  })

  it('should get all cargos from an order', async () => {
    const response = await request(app).get(`/orders/${order.body._id}/cargos`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should not get cargos back from a unknown order', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/orders/${fakeId}/cargos`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Order not found')
  })
})
