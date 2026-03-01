/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, createCustomer, createOrder, clearDatabase, app, request, mongoose } = require('./helper')

describe('Tour', () => {
  let company
  let customer
  let order
  let vehicle
  let tour

  beforeEach(async () => {
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

    tour = await request(app)
      .post(`/companies/${company.body._id}/tours`)
      .send({
        date: '2026-03-16T00:00:00.000Z',
        startLocation: 'Basel',
        endLocation: 'Chur',
        orders: [order.body._id],
        state: 'PLANNED',
      })
  })

  it('should create a tour', async () => {
    expect(tour.status).toBe(201)
    expect(tour.body).toMatchObject({ startLocation: 'Basel' })
  })

  it('should add an order to a tour', async () => {
    const newOrder = await request(app)
      .post(`/customers/${customer.body._id}/orders`)
      .send({
        origin: 'Lucerne',
        destination: 'Geneva',
        deliveryDate: '2026-05-17T00:00:00.000Z',
        billingInfo: customer.body.billingInfo[0],
        cargos: [
          {
            loadCarrierType: 'Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 500,
            quantity: 2,
          },
        ],
      })

      const response = await request(app).post(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ orderId: newOrder.body._id })
      expect(response.status).toBe(200)
      expect(response.body.orders).toHaveLength(2)
  })

  it('should find a tour by its ID', async () => {
    const response = await request(app).get(`/tours/${tour.body._id}`)
    expect(response.status).toBe(200)
    expect(response.body.startLocation).toBe('Basel')
  })

  it('should not find a tour by its ID if tour does not exist', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/tours/${fakeId}`)
    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should assign a vehicle to a tour', async () => {
    const response = await request(app).put(`/tours/${tour.body._id}/vehicles`).send({ vehicleId: vehicle.body._id })
    expect(response.status).toBe(200)
    expect(response.body.vehicleId.name).toBe('Truck1')
  })

  it('should get the cargos on a tour', async() => {
    const response = await request(app).get(`/tours/${tour.body._id}/cargos`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should not assign a vehicle which is not available', async () => {
    const vehicleNotAvailable = await request(app).put(`/companies/${company.body._id}/vehicles/${vehicle.body._id}`).send({
        state: 'IN_GARAGE'
    })
    const response = await request(app).put(`/tours/${tour.body._id}/vehicles`).send({ vehicleId: vehicleNotAvailable.body._id })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Vehicle is not available')
  })

  it('should not find a tour if it does not exist when trying to add a order to a tour', async () => {
    const fakeId = new mongoose.Types.ObjectId()
     const newOrder = await request(app)
      .post(`/customers/${customer.body._id}/orders`)
      .send({
        origin: 'Lucerne',
        destination: 'Geneva',
        deliveryDate: '2026-05-17T00:00:00.000Z',
        billingInfo: customer.body.billingInfo[0],
        cargos: [
          {
            loadCarrierType: 'Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 500,
            quantity: 2,
          },
        ],
      })

      const response = await request(app).post(`/companies/${company.body._id}/tours/${fakeId}`).send({ orderId: newOrder.body._id })
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Tour not found')
  })

  it('should not find a fake tour when trying to get the cargos', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).get(`/tours/${fakeId}/cargos`)
    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should not find a tour when it does not exist when assigning a vehicle to a tour', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).put(`/tours/${fakeId}/vehicles`).send({ vehicleId: vehicle.body._id })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should not find a vehicle when it does not exist when assigning this vehicle to a tour', async() => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await request(app).put(`/tours/${tour.body._id}/vehicles`).send({ fakeId })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe( 'Vehicle not found' )
  })

})
