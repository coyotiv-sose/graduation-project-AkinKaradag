/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const {
  createCompany,
  createCustomer,
  createOrder,
  clearDatabase,
  loginAsAdmin,
  sanitizeBillingSnippet,
  mongoose,
} = require('./helper')

describe('Tour', () => {
  let agent
  let company
  let customer
  let order
  let vehicle
  let tour

  beforeEach(async () => {
    await clearDatabase()
    agent = await loginAsAdmin()
    company = await createCompany(agent)
    customer = await createCustomer(agent, company.body._id)
    order = await createOrder(agent, customer.body._id, sanitizeBillingSnippet(customer.body.billingInfo[0]))

    vehicle = await agent.post(`/companies/${company.body._id}/vehicles`).send({
      name: 'Truck1',
      brand: 'Mercedes',
      model: 'Sprinter',
      year: 2005,
      payLoad: 800,
    })

    tour = await agent.post(`/companies/${company.body._id}/tours`).send({
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
    const newOrder = await agent.post(`/customers/${customer.body._id}/orders`).send({
      origin: 'Lucerne',
      destination: 'Geneva',
      deliveryDate: '2026-05-17T00:00:00.000Z',
      billingInfo: sanitizeBillingSnippet(customer.body.billingInfo[0]),
      cargos: [
        {
          loadCarrierType: 'Palette',
          dimensions: { width: 1.2, length: 0.8, height: 1.5 },
          weight: 500,
          quantity: 2,
        },
      ],
    })

    const response = await agent.post(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ orderId: newOrder.body._id })
    expect(response.status).toBe(200)
    expect(response.body.orders).toHaveLength(2)
  })

  it('should find a tour by its ID', async () => {
    const response = await agent.get(`/tours/${tour.body._id}`)
    expect(response.status).toBe(200)
    expect(response.body.startLocation).toBe('Basel')
  })

  it('should not find a tour by its ID if tour does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.get(`/tours/${fakeId}`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should assign a vehicle to a tour', async () => {
    const response = await agent.put(`/tours/${tour.body._id}/vehicles`).send({ vehicleId: vehicle.body._id })
    expect(response.status).toBe(200)
    expect(response.body.vehicle.name).toBe('Truck1')
  })

  it('should get the cargos on a tour', async () => {
    const response = await agent.get(`/tours/${tour.body._id}/cargos`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('should not assign a vehicle which is not available', async () => {
    const vehicleNotAvailable = await agent.put(`/companies/${company.body._id}/vehicles/${vehicle.body._id}`).send({
      state: 'IN_GARAGE',
    })
    const response = await agent.put(`/tours/${tour.body._id}/vehicles`).send({ vehicleId: vehicleNotAvailable.body._id })
    expect(response.status).toBe(409)
    expect(response.body.error).toBe('Vehicle is not available')
  })

  it('should not find a tour if it does not exist when trying to add a order to a tour', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const newOrder = await agent.post(`/customers/${customer.body._id}/orders`).send({
      origin: 'Lucerne',
      destination: 'Geneva',
      deliveryDate: '2026-05-17T00:00:00.000Z',
      billingInfo: sanitizeBillingSnippet(customer.body.billingInfo[0]),
      cargos: [
        {
          loadCarrierType: 'Palette',
          dimensions: { width: 1.2, length: 0.8, height: 1.5 },
          weight: 500,
          quantity: 2,
        },
      ],
    })

    const response = await agent.post(`/companies/${company.body._id}/tours/${fakeId}`).send({ orderId: newOrder.body._id })
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should not find a fake tour when trying to get the cargos', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.get(`/tours/${fakeId}/cargos`)
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should not find a tour when it does not exist when assigning a vehicle to a tour', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.put(`/tours/${fakeId}/vehicles`).send({ vehicleId: vehicle.body._id })
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Tour not found')
  })

  it('should not find a vehicle when it does not exist when assigning this vehicle to a tour', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.put(`/tours/${tour.body._id}/vehicles`).send({ vehicleId: fakeId })
    expect(response.status).toBe(404)
    expect(response.body.error).toBe('Vehicle not found')
  })

  it('should not create a tour if required fields are empty', async () => {
    const response = await agent.post(`/companies/${company.body._id}/tours`).send({})
    expect(response.status).toBe(400)
  })

  it('should get all Tours of a company', async () => {
    await agent.post(`/companies/${company.body._id}/tours`).send({
      date: '2026-03-16T00:00:00.000Z',
      startLocation: 'Zurich',
      endLocation: 'Chur',
      orders: [order.body._id],
      state: 'PLANNED',
    })
    const response = await agent.get(`/companies/${company.body._id}/tours`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
  })

  it('should not get all tours for a company with an invalid id', async () => {
    const response = await agent.get('/companies/invalid-id/tours')
    expect(response.status).toBe(400)
  })

  it('should start a tour', async () => {
    const response = await agent.put(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ state: 'STARTED' })
    expect(response.status).toBe(200)
    expect(response.body.state).toBe('STARTED')
  })

  it('should end a tour', async () => {
    const response = await agent.put(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ state: 'FINISHED' })
    expect(response.status).toBe(200)
    expect(response.body.state).toBe('FINISHED')
  })

  it('should not start or end a tour', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await agent.put(`/companies/${company.body._id}/tours/${fakeId}`).send({ state: 'STARTED' })
    expect(response.status).toBe(404)
  })

  it('should update tour location', async () => {
    const response = await agent.put(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ startLocation: 'Zürich' })

    expect(response.status).toBe(200)
    expect(response.body.startLocation).toBe('Zürich')
  })

  it('should update tour vehicle by vehicleId on company route', async () => {
    const response = await agent.put(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ vehicleId: vehicle.body._id })

    expect(response.status).toBe(200)
    const updatedVehicleId = response.body.vehicle._id ?? response.body.vehicle
    expect(updatedVehicleId.toString()).toBe(vehicle.body._id.toString())
  })

  it('should not assign another company vehicle on company route update', async () => {
    const secondCompany = await createCompany(agent, {
      companyName: 'otherCo',
      address: 'Other St 9',
      postalCode: '1111',
      city: 'Elsewhere',
    })
    const foreignVehicle = await agent.post(`/companies/${secondCompany.body._id}/vehicles`).send({
      name: 'Truck2',
      brand: 'MAN',
      model: 'TGL',
      year: 2008,
      payLoad: 900,
    })

    const response = await agent.put(`/companies/${company.body._id}/tours/${tour.body._id}`).send({ vehicleId: foreignVehicle.body._id })

    expect(response.status).toBe(403)
    expect(response.body.error).toBe('Forbidden')
  })
})
